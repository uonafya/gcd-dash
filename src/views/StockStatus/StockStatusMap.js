import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  filterUrlConstructor,
  getValidOUs,
  justFetch
} from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';
import MapData from 'common/maps/counties.min.json'
import MapCenters from 'common/maps/county-centers-coordinates.json'

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(ep => ep.page == 'Stock status').pop();
const periodFilterType = paige.periodFilter;
const endpoints = paige.endpoints;

const abortRequests = new AbortController();

const queryString = require('query-string');
const useStyles = makeStyles(theme => ({
  root: { padding: theme.spacing(3) },
  content: { marginTop: theme.spacing(1) },
  gridchild: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

const StockStatusMap = props => {
  const classes = useStyles();

  let filter_params = queryString.parse(props.location.hash);
  if (
    filter_params.pe &&
    filter_params.pe.search(';') > 0 &&
    periodFilterType != 'range'
  ) {
    filter_params.pe = 'LAST_MONTH';
  }
  let [url, setUrl] = useState(
    filterUrlConstructor(
      filter_params.pe,
      '', //filter_params.ou,
      '2', //filter_params.level,
      endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url": "url"]
    )
  );
  const [sdata, setSSData] = useState([null]);
  const [prd, setPrd] = useState(null);
  const [validOUs, setValidOUs] = useState(
    JSON.parse(localStorage.getItem('validOUs'))
  );
  const [oun, setOun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  let title = `Stock Status: All commodities`;

  const updateData = (rws, priod, ogu, levl) => {
    // console.log(`updateData = pe: ${prd}, ou:${oun}, lv:${oulvl}`)
    setSSData(rws);
    // setPrd(priod)
    // setOun(ogu)
    // setOulvl(levl)
  };
  let fetchAll = async the_url => {
    setLoading(true);
    setSSData([null]);
    try {
    //   fetch(the_url, { signal: abortRequests.signal })
      justFetch(the_url, { signal: abortRequests.signal })
        // .then(s_p => s_p.json())
        .then(reply => {
          if (reply.fetchedData == undefined || reply.fetchedData?.error) {
            setErr({
              error: true,
              msg: reply.fetchedData.message,
              ...reply.fetchedData
            });
          } else {
            
            let mapData = []
            reply.fetchedData.metaData.dimensions.ou.map(ou_=>{
              let one_county = {}
              one_county.id = ou_
              one_county.name = reply.fetchedData.metaData.items[ou_].name
              one_county.data = []
              reply.fetchedData.metaData.dimensions.dx.map(dx_=>{
                let dxrws = reply.fetchedData.rows.find(rw=>rw[0]===dx_ && rw[2]===ou_)
                if(dxrws){
                  one_county.data.push({
                    "name": reply.fetchedData.metaData.items[dxrws[0]].name.replace('MOH 743 Rev2020_','').replace('HCD - ','').replace(' - HF','') || dxrws[0],
                    "period": reply.fetchedData.metaData.items[dxrws[1]].name || dxrws[1],
                    "value": (!isNaN( parseFloat(dxrws[3]) ) ? parseFloat(dxrws[3]) : 0)
                  })
                }
              })
              mapData.push(one_county)
            })
            setErr({ error: false, msg: '' });

            updateData(
              mapData,
              reply.fetchedData.metaData.items[
                reply.fetchedData.metaData.dimensions.pe[0]
              ].name,
              '',
              '2'
            );
          }
          setLoading(false);
        })
        .catch(err => {
			if(abortRequests.signal.aborted){ //if(err.name !== "AbortError"){
				setLoading(false);
				setErr({ error: true, msg: `Error fetching data: ' ${process .env.REACT_APP_ENV == "dev" ? err.message : ""}` });
			}else{
				console.log("Cancelling fetchAll requests");
			}
        });
    } catch (er) {
      setErr({ error: true, msg: `Error fetching data ${process .env.REACT_APP_ENV == "dev" ? er.message : ""}` });
    }
  };

  const onUrlChange = base_url => {
    props.history.listen((location, action) => {
		if(location.pathname == paige.route){
			let new_filter_params = queryString.parse(location.hash);
			if (
				new_filter_params.pe != '~' &&
				new_filter_params.pe != '' &&
				new_filter_params.pe != null
			) {
				setPrd(new_filter_params.pe);
			}
			// if (
			// 	new_filter_params.ou != '~' &&
			// 	new_filter_params.ou != '' &&
			// 	new_filter_params.ou != null
			// ) {
			// 	setOun(new_filter_params.ou);
			// }
			// if (
			// 	new_filter_params.level != '~' &&
			// 	new_filter_params.level != '' &&
			// 	new_filter_params.level != null
			// ) {
			// 	setOulvl('2')//new_filter_params.level);
			// }
			let new_url = filterUrlConstructor(
				new_filter_params.pe,
				'',//new_filter_params.ou,
				'2',//new_filter_params.level,
				base_url
			);
      setUrl(new_url)
			fetchAll(new_url);
		}
    });
  };

  useEffect(() => {
    let mounted = true
    if(mounted){
      onUrlChange(endpoints[0][process.env.REACT_APP_ENV == "dev" ? "local_url": "url"]);
      fetchAll(url);
      getValidOUs().then(vo => {
        let vFlS = JSON.parse(localStorage.getItem('validOUs'));
        if (vFlS && vFlS.length < 1) {
          setValidOUs(vo);
          // localStorage.removeItem('validOUs')
          // console.log("refetching validOUs with getValidOUs")
          // localStorage.setItem('validOUs', JSON.stringify(vo))
        }
      });
    }

    return () => {
      mounted = false
      console.log(`SS:All aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  return (
    <div className={classes.root}>
      <Toolbar
        className={classes.gridchild}
        title={title}
        pe={prd}
        ou={''}
        lvl={oulvl}
        filter_params={filter_params}
      />
      <div className={classes.content}>
        {err.error ? (
          <Alert severity="error">{err.msg}</Alert>
        ) : <>
            {/* <a href={url} rel="noreferrer noopener" target="_blank">{url}</a><hr/>{JSON.stringify(sdata,' ',2)} */}
            <div id="ssMap">
              <>
                <MapContainer center={[0.218389, 37.817222]} zoom={7.49} maxZoom={9.00} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                    <GeoJSON data={MapData} style={`color: '#006400'; weight: 5; opacity: 0.65;`} />
                    {(sdata != null && sdata.length>0 && sdata[0] != null) ? sdata.map(sd=>
                      <Marker key={sd?.id} position={[MapCenters.find(mc=>mc.dhis_id==sd.id)?.latitude, MapCenters.find(mc=>mc.dhis_id==sd.id)?.longitude]}>
                        <Popup>
                          <Typography variant="h4" align="center">{sd.name.toUpperCase()}</Typography>
                          <div style={{height: '300px', overflowY: 'auto',}}>
                            <table border={0} cellSpacing={0} cellPadding={0}>
                              <thead>
                                <tr>
                                  <th style={{padding: '2px', borderBottom: '1px solid #888'}}>Data</th>
                                  <th style={{padding: '2px', borderBottom: '1px solid #888'}}>Period</th>
                                  <th style={{padding: '2px', borderBottom: '1px solid #888'}}>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sd.data.map(tr=><tr key={tr.name}>
                                  <td style={{padding: '2px', borderBottom: '1px solid #888'}}>{tr.name}</td>
                                  <td style={{padding: '2px', borderBottom: '1px solid #888'}}>{tr.period}</td>
                                  <td style={{padding: '2px 4px', borderBottom: '1px solid #888', textAlign: 'right', fontWeight: 'bold'}}>{tr.value}</td>
                                </tr>)}
                              </tbody>
                            </table>
                          </div>
                        </Popup>
                      </Marker>
                    ) : ""}
                </MapContainer>
              </>
            </div>

          </>
        }
      </div>
    </div>
  );
};

export default StockStatusMap;
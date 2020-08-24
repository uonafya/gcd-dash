import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { filterUrlConstructor, justFetch } from '../../common/utils';
import { programs } from 'hcd-config';
import Toolbar from 'components/Toolbar/Toolbar';
import Table from 'components/Table/Table';

const activProgId = parseFloat(localStorage.getItem('program')) || 1;
const activProg = programs.filter(pr => pr.id == activProgId)[0];
const paige = activProg.pages.filter(
  ep => ep.page == 'All Malaria Commodities'
)[0];
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

const NatCommodities = props => {
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
      filter_params.ou,
      filter_params.level,
      endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']
    )
  );
  const [natcomdata, setNatComData] = useState([['Loading...']]);
  const [prd, setPrd] = useState(null);
  const [oun, setOun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oulvl, setOulvl] = useState(null);
  const [err, setErr] = useState({ error: false, msg: '' });
  let title = `National: All Commodities`;

  const updateData = (rws, priod, ogu, levl) => {
    setNatComData(rws);
    // setPrd(priod)
    // setOun(ogu)
    // setOulvl(levl)
  };

  //////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\
  // const getVal = (arry, commo) => {
  // 	let valu = filterItems(arry, commo);
  // 	let thevalue
  //     if (valu[0] != undefined) {
  //         thevalue = valu[0][3];
  //     }
  //     return thevalue;
  // };
  const filterItems = (array, query) => {
    return array.filter(function(el) {
      return el.indexOf(query) > -1;
    });
  };
  const sumArr = array => {
    let sum_total = 0;
    if (array == null || array == undefined) {
      array = [0];
    }
    array.map(val => {
      if (val == null || val == undefined) {
        val = 0;
      }
      sum_total += parseFloat(val);
    });
    return sum_total;
  };
  //////// CUSTOM FXNs \\\\\\\\\\\\\\\\\\\\\\\\

  let fetchNatComm = async the_url => {
    setLoading(true);
    setErr({ error: false, msg: '' });
    setNatComData([['Loading...']]);
    try {
      //   fetch(the_url, { signal: abortRequests.signal })
      justFetch(the_url, { signal: abortRequests.signal })
        // .then(s_p => s_p.json())
        .then(reply => {
          if (reply.fetchedData.error) {
            setLoading(false);
            setErr({
              error: true,
              msg: reply.fetchedData.message,
              ...reply.fetchedData
            });
          } else {
            setErr({ error: false, msg: '' });
            /// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            /// ~~~~~~~~~~~~~~~~~~~~~~ <SUCCESS ~~~~~~~~~~~~~~~~~~~~~~~~~~
            /// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            let tableData = [];
            let dxidsadjc = [];
            let dxidskemsa = [];
            let dxidshfs = [];

            let count = 0;

			let products = []
			reply.fetchedData.metaData.dimensions.dx.map(dx=>{
				if(reply.fetchedData.metaData.items[dx].name.includes('Consumption')){
					products.push({
						name: reply.fetchedData.metaData.items[dx].name.replace('Consumption','').replace('Adjusted', '').replace('MCD_','').trim(),
						id: dx
					})
				}
			})

            // let dxuom = [ "doses", "doses", "doses", "doses", "vials", "tablets", "tests", ];

            reply.fetchedData.metaData.dimensions.dx.map((dxentry, dx_inx) => {
            //   console.log(
            //     dx_inx +
            //       ': (' +
            //       dxentry +
            //       ') => ' +
            //       reply.fetchedData.metaData.items[dxentry].name
            //   );
              if (count <= 6) {
                dxidsadjc.push(dxentry);
              }
              if (count > 6 && count <= 13) {
                dxidskemsa.push(dxentry);
              }
              if (count > 13 && count <= 20) {
                dxidshfs.push(dxentry);
              }

              count++;
            });

            let adjcvalues = [];
            let kemsavalues = [];
            let hfsvalues = [];

            dxidsadjc.map(rowentry => {
              reply.fetchedData.rows.map(rowentry2 => {
                if (rowentry == rowentry2[0]) {
                  adjcvalues.push(parseFloat(rowentry2[3]));
                }
              });
            });

            let kemsaidvals = [];
            dxidskemsa.map(rowentry => {
              reply.fetchedData.rows.map(rowentry2 => {
                if (rowentry2[0] == rowentry) {
                  if (kemsaidvals.indexOf(rowentry2[0]) >= 0) {
                  } else {
                    kemsaidvals.push(rowentry2[0]);
                  }
                }
              });
            });

            //get kemsa values
            dxidskemsa.map(rowentry => {
              if (kemsaidvals.indexOf(rowentry) >= 0) {
                reply.fetchedData.rows.map(rowentry2 => {
                  if (rowentry == rowentry2[0]) {
                    if (rowentry2[3]) {
                      kemsavalues.push(rowentry2[3]);
                    } else {
                      kemsavalues.push(0);
                    }
                  }
                });
              } else {
                kemsavalues.push(0);
              }
            });

            //get hfs values
            dxidshfs.map(rowentry => {
              reply.fetchedData.rows.map(rowentry2 => {
                if (rowentry == rowentry2[0]) {
                  hfsvalues.push(rowentry2[3]);
                }
              });
            });

            for (let i = 0; i < products.length; i++) {
              let trow = [];

              if (typeof kemsavalues[i] == 'undefined') kemsavalues[i] = 0;

              if (typeof hfsvalues[i] == 'undefined') hfsvalues[i] = 0;

              if (typeof adjcvalues[i] == 'undefined') adjcvalues[i] = 0;

              let total = parseFloat(kemsavalues[i]) + parseFloat(hfsvalues[i]);

              let kemsamos = kemsavalues[i] / adjcvalues[i];

              let hfsmos = hfsvalues[i] / adjcvalues[i];

              let totalmos = total / adjcvalues[i];

              trow.push(products[i].name);
              // trow.push(dxuom[i]);
              trow.push(Math.trunc(adjcvalues[i]).toLocaleString());
              trow.push(Math.trunc(kemsavalues[i]).toLocaleString());
              trow.push(Math.trunc(hfsvalues[i]).toLocaleString());
              trow.push(Math.trunc(total).toLocaleString());
              trow.push(kemsamos.toFixed(1));
              trow.push(hfsmos.toFixed(1));
              trow.push(totalmos.toFixed(1));

              tableData.push(trow);
            }
            let o_gu =
              reply.fetchedData.metaData.items[
                reply.fetchedData.metaData.dimensions.ou[0]
              ].name || oun;
            updateData(
              tableData,
              reply.fetchedData.metaData.items[
                reply.fetchedData.metaData.dimensions.pe[0]
              ].name,
              o_gu,
              oulvl
            );
            /// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            /// ~~~~~~~~~~~~~~~~~~~~~~ SUCCESS/> ~~~~~~~~~~~~~~~~~~~~~~~~~~
            /// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          }
          setLoading(false);
        })
        .catch(err => {
			if(abortRequests.signal.aborted){ //if(err.name !== "AbortError"){
				setLoading(false);
				setErr({ error: true, msg: `Error fetching data: ' ${process .env.REACT_APP_ENV == "dev" ? err.message : ""}` });
			}else{
				console.log("Cancelling fetchNatComm requests");
			}
        });
    } catch (er) {
      setErr({
        error: true,
        msg:
          'Error fetching data' + process.env.REACT_APP_ENV == 'dev'
            ? er.message
            : ''
      });
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
			if (
				new_filter_params.ou != '~' &&
				new_filter_params.ou != '' &&
				new_filter_params.ou != null
			) {
				setOun(new_filter_params.ou);
			}
			if (
				new_filter_params.level != '~' &&
				new_filter_params.level != '' &&
				new_filter_params.level != null
			) {
				setOulvl(new_filter_params.level);
			}
			let new_url = filterUrlConstructor(
				new_filter_params.pe,
				new_filter_params.ou,
				new_filter_params.level,
				base_url
			);
			fetchNatComm(new_url);
		}
    });
  };

  useEffect(() => {
    fetchNatComm(url);
    onUrlChange(
      endpoints[0][process.env.REACT_APP_ENV == 'dev' ? 'local_url' : 'url']
    );

    return () => {
      console.log(`NatComm: aborting requests...`);
      abortRequests.abort();
    };
  }, []);

  let data = {};
  data.theads = [
    'Commodity',
    // 'Unit',
    'Adjusted AMC',
    'KEMSA SOH',
    'Facilities SOH',
    'Total SOH',
    'KEMSA MOS',
    'Facilities MOS',
    'Total MOS'
  ];
  data.rows = natcomdata;

  return (
    <div className={classes.root}>
      <Toolbar
        className={classes.gridchild}
        title={title}
        pe={prd}
        ou={oun}
        lvl={oulvl}
        filter_params={filter_params}
      />
      <div className={classes.content}>
        {err.error ? (
          <Alert severity="error">{err.msg}</Alert>
        ) : (
          <Table
            pageTitle={title}
            theads={data.theads}
            rows={data.rows}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default NatCommodities;

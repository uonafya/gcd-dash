import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Minimal as MinimalLayout } from './layouts';

import {
  Dashboard as DashboardView,
  Landing as LandingView,
  UserList as UserListView,
  NotFound as NotFoundView,
  StockStatusOne,
  StockStatusAll,
  RRSummary,
  RRFacility,
  RRSubcounty,
  DQConsistency,
  DQConcordance,
  DQCompleteness,
  DQComparison,
  SCSummary,
  SCTrends,
  NatSummary,
  NatIssuesR,
  NatPendingShip,
  NatCommodities,
  HFunderstocked,
  HFoverstocked
} from './views';
import StockedDataProvider from 'contexts/StockedData';

const Routes = () => {
  return (
    <Switch>
      <StockedDataProvider>
        {/* <Redirect exact from="/" to="/dashboard" /> */}
      <RouteWithLayout
        component={LandingView}
        exact
        layout={MinimalLayout}
        path="/"
      />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />
      {/*  Stock status  */}
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/ss"
      />
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/stockstatus"
      />
      <RouteWithLayout
        component={StockStatusOne}
        exact
        layout={MainLayout}
        path="/ss/commodity"
      />
      <RouteWithLayout
        component={StockStatusAll}
        exact
        layout={MainLayout}
        path="/ss/all"
      />
      {/*  Stock status  */}
      {/*  Data quality  */}
      <RouteWithLayout
        component={DQCompleteness}
        exact
        layout={MainLayout}
        path="/dq"
      />
      <RouteWithLayout
        component={DQCompleteness}
        exact
        layout={MainLayout}
        path="/dq/completeness"
      />
      <RouteWithLayout
        component={DQConcordance}
        exact
        layout={MainLayout}
        path="/dq/concordance"
      />
      <RouteWithLayout
        component={DQConsistency}
        exact
        layout={MainLayout}
        path="/dq/consistency"
      />
      <RouteWithLayout
        component={DQComparison}
        exact
        layout={MainLayout}
        path="/dq/comparison"
      />
      {/*  Data quality  */}
      {/*  Reporting rate  */}
      <RouteWithLayout
        component={RRSummary}
        exact
        layout={MainLayout}
        path="/rr"
      />
      <RouteWithLayout
        component={RRSummary}
        exact
        layout={MainLayout}
        path="/rr/summary"
      />
      <RouteWithLayout
        component={RRFacility}
        exact
        layout={MainLayout}
        path="/rr/facility"
      />
      <RouteWithLayout
        component={RRSubcounty}
        exact
        layout={MainLayout}
        path="/rr/subcounty"
      />
      {/*  Reporting rate  */}
      {/*  Supply chain perf  */}
      <RouteWithLayout
        component={SCSummary}
        exact
        layout={MainLayout}
        path="/scp"
      />
      <RouteWithLayout
        component={SCSummary}
        exact
        layout={MainLayout}
        path="/scp/summary"
      />
      <RouteWithLayout
        component={SCTrends}
        exact
        layout={MainLayout}
        path="/scp/trends"
      />
      {/*  Supply chain perf  */}
      {/*  National  */}
      <RouteWithLayout
        component={NatSummary}
        exact
        layout={MainLayout}
        path="/national"
      />
      <RouteWithLayout
        component={NatSummary}
        exact
        layout={MainLayout}
        path="/national/summary"
      />
      <RouteWithLayout
        component={NatCommodities}
        exact
        layout={MainLayout}
        path="/national/commodities"
      />
      <RouteWithLayout
        component={NatPendingShip}
        exact
        layout={MainLayout}
        path="/national/pending-shipments"
      />
      <RouteWithLayout
        component={NatIssuesR}
        exact
        layout={MainLayout}
        path="/national/issues-receipts"
      />
      {/*  facility follow-up  */}
      <RouteWithLayout
        component={HFunderstocked}
        exact
        layout={MainLayout}
        path="/hff/understocked"
      />
      <RouteWithLayout
        component={HFoverstocked}
        exact
        layout={MainLayout}
        path="/hff/overstocked"
      />
      {/* facility follow-up  */}
      {/*  National  */}
      {/*  404  */}
      <RouteWithLayout
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
      />
      {/*  404  */}
      {/* <Redirect from="/404" to="/not-found" /> */}
      </StockedDataProvider>
      
    </Switch>
  );
};

export default Routes;

import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Map from "../../../shared/components/Map";

import Snackbar, {SnackbarContent}  from '@material-ui/core/Snackbar';


function Dashboard(props) {
  const [showMsg, setShowMsg] = useState(false);

  const {
    selectDashboard,
    markers,
    pushMessageToSnackbar
  } = props;

  useEffect(()=>{
    selectDashboard();
  }, [
    selectDashboard
  ]);

  useEffect(()=>{
    if(pushMessageToSnackbar && pushMessageToSnackbar.text)setShowMsg(true);
  }, [
    pushMessageToSnackbar
  ]);

  const onClose = ()=>{
    setShowMsg(false);
  }

  return (
    <Fragment>
     <div style={{'position':'relative','width':'100%', 'height':'100%'}}>
      {markers  ? <Map markers={markers} fullHeight enableSearch/> : null}
     </div>
     <Snackbar
        open={showMsg}
        autoHideDuration={6000}
        onClose={onClose}
        message={pushMessageToSnackbar?.text}
      />
    </Fragment>
  );
}

Dashboard.propTypes = {
  markers : PropTypes.arrayOf(PropTypes.object).isRequired,
  selectDashboard: PropTypes.func.isRequired,
  pushMessageToSnackbar: PropTypes.shape({
    text: PropTypes.string.isRequired
  })
};

export default Dashboard;

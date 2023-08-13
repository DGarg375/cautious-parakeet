import React, { memo, useCallback, useState,  Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core";
import Routing from "./Routing";
import NavBar from "./navigation/NavBar";
import ConsecutiveSnackbarMessages from "../../shared/components/ConsecutiveSnackbarMessages";
import smoothScrollTop from "../../shared/functions/smoothScrollTop";
import LazyLoadAddBalanceDialog from "./subscription/LazyLoadAddBalanceDialog";
import {fetchMapData} from "../../shared/services/maps.service";

import {subscribeEventChange} from "../../shared/services/event.service";

const styles = (theme) => ({
  main: {
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("xs")]: {
      marginLeft: 0,
    },
  },
});


function Main(props) {
  const { classes } = props;
  const [selectedTab, setSelectedTab] = useState(null);
  const [isAddBalanceDialogOpen, setIsAddBalanceDialogOpen] = useState(false);
  const [pushMessageToSnackbar, setPushMessageToSnackbar] = useState(null);

  const [mapFetchedOnce, setHasMapFetchedOnce] = useState(false);
  const [markers, setMarkers] = useState([]);

  const [event,setEvent] = useState("1"); 

  const openAddBalanceDialog = useCallback(() => {
    setIsAddBalanceDialogOpen(true);
  }, [setIsAddBalanceDialogOpen]);

  const closeAddBalanceDialog = useCallback(() => {
    setIsAddBalanceDialogOpen(false);
  }, [setIsAddBalanceDialogOpen]);

  const onPaymentSuccess = useCallback(() => {
    setPushMessageToSnackbar({
      text: "Payment received. Thanks",
    });
    setIsAddBalanceDialogOpen(false);

    refreshMap()
  }, [pushMessageToSnackbar, setIsAddBalanceDialogOpen]);

  
  const selectDashboard = useCallback(() => {
    smoothScrollTop();
    document.title = "GlobalDiwali - Dashboard";
    setSelectedTab("Dashboard");

    if(!mapFetchedOnce){
      refreshMap();
      setHasMapFetchedOnce(true)
    }
  }, [setSelectedTab]);

  useEffect(async () => {
    subscribeEventChange().subscribe(s=>{
      setEvent(s.data)
    })
  },[])

  useEffect(async () => {
    console.log("Refresh map..")
    await refreshMap()
  }, [event]);

  const getPushMessageFromChild = useCallback(
    (pushMessage) => {
      setPushMessageToSnackbar(() => pushMessage);
    },
    [setPushMessageToSnackbar]
  );

  const refreshMap = async ()=>{
    setMarkers([]);
    setPushMessageToSnackbar({
      text: "Wait..",
    })
    const all = await fetchMapData(event);
    setMarkers(all?.markers)
  }

  return (
    <Fragment>
      <LazyLoadAddBalanceDialog
        open={isAddBalanceDialogOpen}
        onClose={closeAddBalanceDialog}
        onSuccess={onPaymentSuccess}
      />
      <NavBar
        selectedTab={selectedTab}
        openAddBalanceDialog={openAddBalanceDialog}
      />
      <ConsecutiveSnackbarMessages
        getPushMessageFromChild={getPushMessageFromChild}
      />
      <main className={classNames(classes.main)}>
        <Routing
          markers = {markers}
          pushMessageToSnackbar={pushMessageToSnackbar}
          selectDashboard={selectDashboard}
          openAddBalanceDialog={openAddBalanceDialog}
        />
      </main>
    </Fragment>
  );
}

Main.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(memo(Main));

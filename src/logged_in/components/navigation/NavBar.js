import React,{ Fragment, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Link,
  ListItem,
  ListItemText,
  Hidden,
  Box,
  withStyles,
  isWidthUp,
  withWidth,
  Button
} from "@material-ui/core";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import Money from '@material-ui/icons/Money';
import { auth } from '../../../shared/functions/firebase';
import {eventList, setCurrentEvent} from "../../../shared/services/event.service";

const styles = (theme) => ({
  appBar: {
    boxShadow: theme.shadows[6],
    backgroundColor: theme.palette.common.white,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginLeft: 0,
    },
  },
  appBarToolbar: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },
  accountAvatar: {
    backgroundColor: theme.palette.secondary.main,
    height: 24,
    width: 24,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
    },
  },
  drawerPaper: {
    height: "100%vh",
    whiteSpace: "nowrap",
    border: 0,
    width: theme.spacing(7),
    overflowX: "hidden",
    marginTop: theme.spacing(8),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    backgroundColor: theme.palette.common.black,
  },
  smBordered: {
    [theme.breakpoints.down("xs")]: {
      borderRadius: "50% !important",
    },
  },
  menuLink: {
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
  iconListItem: {
    width: "auto",
    borderRadius: theme.shape.borderRadius,
    paddingTop: 11,
    paddingBottom: 11,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  textPrimary: {
    color: theme.palette.primary.main,
  },
  mobileItemSelected: {
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  brandText: {
    fontFamily: "'Baloo Bhaijaan', cursive",
    fontWeight: 400,
  },
  username: {
    paddingLeft: 0,
    paddingRight: theme.spacing(2),
  },
  justifyCenter: {
    justifyContent: "center",
  },
  permanentDrawerListItem: {
    justifyContent: "center",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
});

function NavBar(props) {
  const { classes, width, openAddBalanceDialog } = props;
  const [activeEvents, setActiveEvents] = useState([]);
  // Will be use to make website more accessible by screen readers
 
  const logout = () => {
      auth.signOut();
  }
  
  const getEventList = async ()=>{
    const events = await eventList();
    if(Array.isArray(events))setActiveEvents(events);
  }

  const currentEvent = async (evId)=>{
    setCurrentEvent(evId);
  }

  React.useEffect(getEventList, [])

  return (
    <Fragment>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.appBarToolbar}>
          <Box display="flex" alignItems="center">
              <Typography
                variant="h4"
                className={classes.brandText}
                display="inline"
                color="primary"
              >
                Global
              </Typography>
              <Typography
                variant="h4"
                className={classes.brandText}
                display="inline"
                color="secondary"
              >
                Diwali 
              </Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            {
              activeEvents.map((event,index) => {
                return (
                  <Link
                    className={classNames(classes.iconListItem, classes.smBordered,classes.noDecoration)}
                    onClick={()=>currentEvent(event.id)}
                    key={"EV-"+index}
                  >
                    <Button
                      color="secondary"
                      size="medium"
                      classes={{ text: classes.menuButtonText }}
                    >
                      {event.attributes.name}
                    </Button>
                  </Link>
                )
              })
            }
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
          >
              <Box mr={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={openAddBalanceDialog}
                  disableElevation
                >
                  <Hidden smDown>
                    Light Diyas
                  </Hidden>
                  <Hidden mdUp>
                      <Money fontSize="small" />
                  </Hidden>
                  
                </Button>
              </Box>
           
            <ListItem
              disableGutters
              className={classNames(classes.iconListItem, classes.smBordered)}
            >
              <Avatar
                alt="profile picture"
                src={`${process.env.PUBLIC_URL}/images/logged_in/profilePicture.jpg`}
                className={classNames(classes.accountAvatar)}
              />
              {isWidthUp("sm", width) && (
                <ListItemText
                  className={classes.username}
                  primary={
                    <Typography color="textPrimary">{auth && auth.currentUser && auth.currentUser.phoneNumber?auth.currentUser.phoneNumber:''} </Typography>
                  }
                />
              )}
            </ListItem>

            <IconButton
                  aria-label="Logout"
                  onClick={logout}
                  color="secondary"
                >
              <PowerSettingsNewIcon fontSize="small" />
            </IconButton>

          </Box>
          
        </Toolbar>
      </AppBar>
      
    </Fragment>
  );
}

NavBar.propTypes = {
  width: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  openAddBalanceDialog: PropTypes.func.isRequired,
};

export default withWidth()(withStyles(styles, { withTheme: true })(NavBar));

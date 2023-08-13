import React, {useState} from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  withStyles
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ColoredButton from "../../../shared/components/ColoredButton";
import {privacyPolicy} from "../../../shared/services/constant.service";


const styles = theme => ({
  termsConditionsListitem: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1)
  },
  dialogActions: {
    justifyContent: "flex-start",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  backIcon: {
    marginRight: theme.spacing(1)
  }
});

function TermsOfServiceDialog(props) {
  const { classes, onClose, theme } = props;
  const [policy, setPolicy] = useState([]);

  const getPolicy = async ()=>{
    const response = await privacyPolicy();
    setPolicy(response?.policy)
  }

  React.useEffect(getPolicy, [])

  return (
    <Dialog open scroll="paper" onClose={onClose} hideBackdrop>
      <DialogTitle>Terms and Conditions</DialogTitle>
      <DialogContent dangerouslySetInnerHTML={{__html:policy ? policy : null}}>
        
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <ColoredButton
          onClick={onClose}
          variant="contained"
          color={theme.palette.common.black}
        >
          <ArrowBackIcon className={classes.backIcon} />
          Back
        </ColoredButton>
      </DialogActions>
    </Dialog>
  );
}

TermsOfServiceDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(TermsOfServiceDialog);

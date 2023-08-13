import React, { useState, useCallback, useRef, Fragment } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Button,
  Checkbox,
  Typography,
  FormControlLabel,
  withStyles,
  FormHelperText,
  Box
} from "@material-ui/core";
import FormDialog from "../../../shared/components/FormDialog";
import HighlightedInformation from "../../../shared/components/HighlightedInformation";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import { firebase, auth } from '../../../shared/functions/firebase';
import {createUser} from "../../../shared/services/user.service";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import MTPhoneInput from '../../../shared/components/MTPhoneInput';

const styles = (theme) => ({
  forgotPassword: {
    marginTop: theme.spacing(2),
    color: theme.palette.primary.main,
    cursor: "pointer",
    "&:enabled:hover": {
      color: theme.palette.primary.dark,
    },
    "&:enabled:focus": {
      color: theme.palette.primary.dark,
    },
  },
  disabledText: {
    cursor: "auto",
    color: theme.palette.text.disabled,
  },
  formControlLabel: {
    marginRight: 0,
  },
  link: {
    transition: theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeInOut,
    }),
    cursor: "pointer",
    color: theme.palette.primary.main,
    "&:enabled:hover": {
      color: theme.palette.primary.dark,
    },
    "&:enabled:focus": {
      color: theme.palette.primary.dark,
    },
  },
});

function LoginDialog(props) {
  const {
    setStatus,
    history,
    classes,
    onClose,
    openChangePasswordDialog,
    status,
    theme,
    openTermsDialog
  } = props;
  const registerTermsCheckbox = useRef();
  const [hasTermsOfServiceError, setHasTermsOfServiceError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [final, setFinal] = useState('');

  const loginEmail = useRef();
  const loginPassword = useRef();

  const numberRef = useRef();
  const [number, setNumber] = useState('');
  const otpRef = useRef();
  let verify;

  //Signup user
  const signup = async () => {
    if (!number || number.length < 10) {
      return;
    }

    const res = await createUser(number);
    return await res.json();
  }

  // Sent OTP
  const signin = () => {
      if (!number || number.length < 10) {
        setShowOTP(false);
        setIsLoading(false);
        return;
      }

      
      if(!verify)verify = new firebase.auth.RecaptchaVerifier('recaptcha-container');

      let myNumber = number;
      auth.signInWithPhoneNumber(myNumber, verify).then((result) => {
          setFinal(result);
          setShowOTP(true);
          setIsLoading(false);
          setNumber(myNumber);
      }).catch((err) => {
          setIsLoading(false);
          window.location.reload()
      });
  }

  // Validate OTP
  const ValidateOtp = () => {
      if (!otpRef || !otpRef.current || otpRef.current.value === null || final === null)return;

      final.confirm(otpRef.current.value).then(async (result) => {
          const signupResponse = await signup();
          if(signupResponse && (signupResponse.message == "SIGNUP_SUCCESS" || (signupResponse.code == 500 && signupResponse.message.indexOf("This attribute must be unique:")>=0))){
            history.push("/c/dashboard");
          }
      }).catch((err) => {
          setStatus("invalidOtp");
          setIsLoading(false);
      })
  }

  const login = useCallback(() => {

    if (!registerTermsCheckbox.current.checked) {
      setHasTermsOfServiceError(true);
      return;
    }

    setIsLoading(true);
    setStatus(null);

    if(!showOTP){
      signin()
    }else{
      ValidateOtp()
    }

    /*if (loginEmail.current.value !== "test@web.com") {
      setTimeout(() => {
        setStatus("invalidEmail");
        setIsLoading(false);
      }, 1500);
    } else if (loginPassword.current.value !== "HaRzwc") {
      setTimeout(() => {
        setStatus("invalidPassword");
        setIsLoading(false);
      }, 1500);
    } else {
      setTimeout(() => {
        history.push("/c/dashboard");
      }, 150);
    }*/
  }, [setIsLoading, loginEmail, loginPassword, history, setStatus ,signin, ValidateOtp, signup, registerTermsCheckbox]) ;

  return (
    <Fragment>
      <FormDialog
        open
        onClose={onClose}
        loading={isLoading}
        onFormSubmit={(e) => {
          e.preventDefault();
          login();
        }}
        fullWidth = {true}
        hideBackdrop
        headline="Login"
        content={
          <Fragment>

            {/*TODO : Move PhoneInput in component , remove dependency*/}
            { !showOTP && <PhoneInput
              ref={numberRef}
              placeholder="Enter phone number"
              value={number}

              defaultCountry="IN"
              variant="outlined"
              margin="normal"
              error={status === "invalidMobile"}
              required
              fullWidth
              label="Mobile"
              inputRef={numberRef}
              autoFocus
              autoComplete="off"
              type="phone"
              onChange={(value) => {
                setNumber(value)
                if (status === "invalidMobile") {
                  setStatus(null);
                }
              }}
              helperText={
                status === "invalidMobile" &&
                "This mobile is invalid."
              }
              FormHelperTextProps={{ error: true }}

              inputComponent={MTPhoneInput}/>
            }             

            {showOTP && <TextField
              variant="outlined"
              margin="normal"
              error={status === "invalidOtp"}
              required
              fullWidth
              label="OTP"
              inputRef={otpRef}
              autoFocus
              autoComplete="off"
              type="number"
              onChange={() => {
                if (status === "invalidOtp") {
                  setStatus(null);
                }
              }}
              helperText={
                status === "invalidOtp" &&
                "This OTP is invalid."
              }
              FormHelperTextProps={{ error: true }}
            />
            }
          
          { !showOTP ? <Box 
                id="recaptcha-container"
                style={{
                  display: "block",
                  marginBottom: theme.spacing(1),
                }}></Box> : null }

            {/*<TextField
              variant="outlined"
              margin="normal"
              error={status === "invalidEmail"}
              required
              fullWidth
              label="Email Address"
              inputRef={loginEmail}
              autoFocus
              autoComplete="off"
              type="email"
              onChange={() => {
                if (status === "invalidEmail") {
                  setStatus(null);
                }
              }}
              helperText={
                status === "invalidEmail" &&
                "This email address isn't associated with an account."
              }
              FormHelperTextProps={{ error: true }}
            />
            <VisibilityPasswordTextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              error={status === "invalidPassword"}
              label="Password"
              inputRef={loginPassword}
              autoComplete="off"
              onChange={() => {
                if (status === "invalidPassword") {
                  setStatus(null);
                }
              }}
              helperText={
                status === "invalidPassword" ? (
                  <span>
                    Incorrect password. Try again, or click on{" "}
                    <b>&quot;Forgot Password?&quot;</b> to reset it.
                  </span>
                ) : (
                  ""
                )
              }
              FormHelperTextProps={{ error: true }}
              onVisibilityChange={setIsPasswordVisible}
              isVisible={isPasswordVisible}
            />*/}

           
            {status === "verificationEmailSend" ? (
              <HighlightedInformation>
                We have send instructions on how to reset your password to your
                email address
              </HighlightedInformation>
            ) : (
              <HighlightedInformation>
                Test mobile: <b>+91 7096221959</b>
                <br />
                Password is: <b>123123</b>
              </HighlightedInformation>
            )}


            <FormControlLabel
              style={{ marginRight: 0 }}
              control={
                <Checkbox
                  color="primary"
                  inputRef={registerTermsCheckbox}
                  onChange={() => {
                    setHasTermsOfServiceError(false);
                  }}
                />
              }
              label={
                <Typography variant="body1">
                  I agree to the
                  <span
                    className={classes.link}
                    onClick={isLoading ? null : openTermsDialog}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(event) => {
                      // For screenreaders listen to space and enter events
                      if (
                        (!isLoading && event.keyCode === 13) ||
                        event.keyCode === 32
                      ) {
                        openTermsDialog();
                      }
                    }}
                  >
                    {" "}
                    terms of service
                  </span>
                </Typography>
              }
            />
            {hasTermsOfServiceError && (
              <FormHelperText
                error
                style={{
                  display: "block",
                  marginTop: theme.spacing(-1),
                }}
              >
                In order to create an account, you have to accept our terms of
                service.
              </FormHelperText>
            )}
          </Fragment>
        }
        actions={
          <Fragment>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={isLoading}
              size="large"
            >
              Login
              {isLoading && <ButtonCircularProgress />}
            </Button>
          </Fragment>
        }
      />

    </Fragment>
  );
}

LoginDialog.propTypes = {
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
  openChangePasswordDialog: PropTypes.func.isRequired,
  history: PropTypes.object,
  status: PropTypes.string,
  openTermsDialog: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(LoginDialog);
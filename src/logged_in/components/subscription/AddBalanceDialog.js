import React, { useState, Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Grid, Button, Box, withTheme } from "@material-ui/core";
import StripeCardForm from "./stripe/StripeCardForm";
import FormDialog from "../../../shared/components/FormDialog";
import ColoredButton from "../../../shared/components/ColoredButton";
import HighlightedInformation from "../../../shared/components/HighlightedInformation";
import ButtonCircularProgress from "../../../shared/components/ButtonCircularProgress";
import {pay,confirmPay} from "../../../shared/services/payment.service";

import {getCurrentEvent} from "../../../shared/services/event.service";

import Map from "../../../shared/components/Map";


const stripePromise = loadStripe("pk_test_51K6CRtSEZn1QOu1gYYSDPr96AHFqNjyaa5dAi7uCIfzqnMH9p03UYDNkwRQVSUVrrnxGSi2tmGuVR2R99YN1wKDD009XlRi2QS");

const paymentOptions = ["LOCATION","PAY"];

const AddBalanceDialog = withTheme(function (props) {
  const { open, theme, onClose, onSuccess } = props;

  const [loading, setLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState("LOCATION");
  const [stripeError, setStripeError] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(5);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [position, setPosition] = useState({})
  const [info, setInfo] = useState("")
  const [event,setEvent] = useState(undefined); 

  const [amountError, setAmountError] = useState("");
  const elements = useElements();
  const stripe = useStripe();

  useEffect(async () => {
    setEvent(await getCurrentEvent());
  },[])

  const stripePaymentMethodHandler = async (result) => {
    if (result.error) {
      setStripeError(`Something went wrong : ${result.error}`)
      // Show error in payment form
    } else {
      // Otherwise send paymentMethod.id to your server (see Step 4)
      const paymentResponse = await pay(result.paymentMethod.id,amount,name);

      // Handle server response (see Step 4)
      await handleServerResponse(paymentResponse);
    }
  }

  const handleServerResponse = async (response) => {
    if (response.error) {
      setStripeError(`Something went wrong : ${response.error}`)
      // Show error from server on payment form
    } else if (response.requiresAction) {
      // Use Stripe.js to handle the required card action
      const { error: errorAction, paymentIntent } = await stripe.handleCardAction(response.clientSecret);
      
      if (errorAction) {
        setStripeError(`Something went wrong : ${errorAction}`)
        // Show error from Stripe.js in payment form
      } else {
        // The card action has been handled
        // The PaymentIntent can be confirmed again on the server
        setPaymentIntentId(paymentIntent.id);
        console.log("paymentIntent",paymentIntentId)

        const serverResponse = await confirmPay(paymentIntent.id,amount,name,info,event,[position]);
        

        await handleServerResponse(serverResponse);
      }
    } else {
      console.log("PAYMENT SEUCCESS ",response)
      // Show success message
    }
  }

  const onAmountChange = amount => {
    if (amount < 0) {
      return;
    }
    if (amountError) {
      setAmountError("");
    }
    setAmount(amount);
  };

  const getStripePaymentInfo = () => {
    switch (paymentOption) {
      case "PAY": {
        return {
          type: "card",
          card: elements.getElement(CardElement),
          billing_details: { name: name }
        };
      }
      default:
        throw new Error("No case selected in switch statement");
    }
  };

  const renderPaymentComponent = () => {
    switch (paymentOption) {
      case "PAY":
        return (
          <Fragment>
            <Box mb={2}>
              <StripeCardForm
                stripeError={stripeError}
                setStripeError={setStripeError}
                setName={setName}
                name={name}
                amount={amount}
                amountError={amountError}
                onAmountChange={onAmountChange}
              />
            </Box>
            <HighlightedInformation>
              You can check this integration using the credit card number{" "}
              <b>4242 4242 4242 4242 04 / 24 24 242 42424 </b>
            </HighlightedInformation>
          </Fragment>
        );
      case "LOCATION":
        return (
          <Fragment>
            <Box mb={2}>
              <Map draggable={true} onPositionUpdate={setPosition} onInfoUpdate={setInfo} enableSearch/>
            </Box>
            <HighlightedInformation>
              Drag diya on Map or search for the place where you want to light diya this Diwali
              {/*Drag marker where you want to light diya <br />*/}
              {/*position && position.lat && position.lng? `${position.lat},${position.lng}`:''*/}
            </HighlightedInformation>
          </Fragment>
        );
      default:
        throw new Error("No case selected in switch statement");
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      headline="Light A Diya"
      hideBackdrop={false}
      loading={loading}
      onFormSubmit={async event => {
        event.preventDefault();

        if(paymentOption == "LOCATION"){
          setPaymentOption("PAY")
          return;
        }

        if (amount <= 0) {
          setAmountError("Can't be zero");
          return;
        }
        if (stripeError) {
          setStripeError("");
        }
        setLoading(true);
        const result = await stripe.createPaymentMethod(
          getStripePaymentInfo()
        );
        if (result.error) {
          setStripeError(result.error.message);
          setLoading(false);
          return;
        }else{
          await stripePaymentMethodHandler(result);
        }
        onSuccess();
      }}
      content={
        <Box pb={2}>
          <Box mb={2}>
            <Grid container spacing={1}>
              {paymentOptions.map(option => (
                <Grid item key={option}>
                  <ColoredButton
                    variant={
                      option === paymentOption ? "contained" : "outlined"
                    }
                    disableElevation
                    disabled
                    onClick={() => {
                      setStripeError("");
                      setPaymentOption(option);
                    }}
                    color={theme.palette.common.black}
                  >
                    {option}
                  </ColoredButton>
                </Grid>
              ))}
            </Grid>
          </Box>
          {renderPaymentComponent()}
        </Box>
      }
      actions={
        <Fragment>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            type="submit"
            size="large"
            disabled={loading || !(position && position.lat && position.lng) || !info || info=='' || !event}
          >
            {paymentOption=="LOCATION" ? "NEXT" : "Pay with Stripe"} {loading && <ButtonCircularProgress />}
          </Button>
        </Fragment>
      }
    />
  );
});

AddBalanceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

function Wrapper(props) {
  const { open, onClose, onSuccess } = props;
  return (
    <Elements stripe={stripePromise}>
      {open && (
        <AddBalanceDialog open={open} onClose={onClose} onSuccess={onSuccess} />
      )}
    </Elements>
  );
}


AddBalanceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default Wrapper;

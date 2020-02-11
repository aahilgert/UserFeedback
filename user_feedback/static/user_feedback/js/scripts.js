import { h, Component, render } from "preact";
import Dialog from "preact-material-components/Dialog";
import Button from "preact-material-components/Button";
import List from "preact-material-components/List";
import TextField from "preact-material-components/TextField";
import Radio from "preact-material-components/Radio";
import FormField from "preact-material-components/FormField";
import Icon from "preact-material-components/Icon";
import IconButton from "preact-material-components/IconButton";
import Snackbar from "preact-material-components/Snackbar";
import "preact-material-components/Snackbar/style.css";
import "preact-material-components/IconButton/style.css";
import "preact-material-components/Radio/style.css";
import "preact-material-components/FormField/style.css";
import "preact-material-components/TextField/style.css";
import "preact-material-components/List/style.css";
import "preact-material-components/Button/style.css";
import "preact-material-components/Dialog/style.css";

class DialogPage extends Component {
  state = {
    rating: null,
    text: "",
    author: null,
    url: window.location.pathname,
    type: null
  };

  onSubmit = e => {
    postFeedback(this);
    e.preventDefault();
    this.setState({ rating: null, text: "", type: null });
    for (let i = 1; i < 5; i++) {
      if (
        document
          .getElementById("star-button-" + i)
          .classList.contains("mdc-icon-button--on")
      ) {
        document
          .getElementById("star-button-" + i)
          .classList.remove("mdc-icon-button--on");
      }
    }
  };

  onClose = e => {
    e.preventDefault();
  };

  updateType = e => {
    this.setState({ type: +e.target.id.substr(e.target.id.length - 1) });
  };

  updateRating = e => {
    e.preventDefault();
    this.setState({ rating: +e.target.id.substr(e.target.id.length - 1) });
    for (let i = 1; i < +e.target.id.substr(e.target.id.length - 1); i++) {
      if (
        !document
          .getElementById("star-button-" + i)
          .classList.contains("mdc-icon-button--on")
      ) {
        document
          .getElementById("star-button-" + i)
          .classList.add("mdc-icon-button--on");
      }
    }
    for (let i = +e.target.id.substr(e.target.id.length - 1); i <= 5; i++) {
      document
        .getElementById("star-button-" + i)
        .classList.remove("mdc-icon-button--on");
    }
  };

  updateText = e => {
    this.setState({ text: e.target.value });
  };

  render() {
    return (
      <div>
        <Icon
          id="user-feedback-button"
          primary={true}
          raised={true}
          onClick={() => {
            this.dlg.MDComponent.show();
          }}
          class="material-icons-outlined"
          style="cursor: pointer; font-size: 48px;"
        >
          feedback
        </Icon>
        <Dialog
          style="padding: 0; border: 0; width: 0;"
          ref={dlg => {
            this.dlg = dlg;
          }}
        >
          <form id="feedback-form">
            <Dialog.Header>{this.props.titleParam}</Dialog.Header>
            <Dialog.Body scrollable={false}>
              <div>
                <FormField>
                  <Radio
                    id="radio-1"
                    name="feedback-type"
                    onInput={this.updateType}
                  />
                  <label for="radio-1">Bug Report</label>
                </FormField>
                <FormField>
                  <Radio
                    id="radio-2"
                    name="feedback-type"
                    onInput={this.updateType}
                  />
                  <label for="radio-2">Feature Request</label>
                </FormField>
                <FormField>
                  <Radio
                    id="radio-3"
                    name="feedback-type"
                    onInput={this.updateType}
                  />
                  <label for="radio-3">Review</label>
                </FormField>
              </div>
              <div>
                <IconButton id="star-button-1" onClick={this.updateRating}>
                  <IconButton.Icon id="star-1" on>
                    star
                  </IconButton.Icon>
                  <IconButton.Icon id="star-border-1">
                    star_border
                  </IconButton.Icon>
                </IconButton>
                <IconButton id="star-button-2" onClick={this.updateRating}>
                  <IconButton.Icon id="star-2" on>
                    star
                  </IconButton.Icon>
                  <IconButton.Icon id="star-border-2">
                    star_border
                  </IconButton.Icon>
                </IconButton>
                <IconButton id="star-button-3" onClick={this.updateRating}>
                  <IconButton.Icon id="star-3" on>
                    star
                  </IconButton.Icon>
                  <IconButton.Icon id="star-border-3">
                    star_border
                  </IconButton.Icon>
                </IconButton>
                <IconButton id="star-button-4" onClick={this.updateRating}>
                  <IconButton.Icon id="star-4" on>
                    star
                  </IconButton.Icon>
                  <IconButton.Icon id="star-border-4">
                    star_border
                  </IconButton.Icon>
                </IconButton>
                <IconButton id="star-button-5" onClick={this.updateRating}>
                  <IconButton.Icon id="star-5" on>
                    star
                  </IconButton.Icon>
                  <IconButton.Icon id="star-border-5">
                    star_border
                  </IconButton.Icon>
                </IconButton>
              </div>
              <div>
                <TextField
                  textarea={true}
                  label="text"
                  value={this.state.text}
                  onInput={this.updateText}
                  maxlength="400"
                />
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <a href="https://scivero.com">
                <img
                  src={this.props.logoUrl}
                  style="position: absolute; width: 100px; left: 0; padding-left: 24px; bottom: 0; padding-bottom: 14px;"
                  alt="Scivero"
                />
              </a>
              <Dialog.FooterButton cancel={true} onClick={this.onClose}>
                Cancel
              </Dialog.FooterButton>
              <Dialog.FooterButton
                accept={true}
                disabled={
                  this.state.type == null ||
                  (this.state.rating == null &&
                    (!this.state.text || this.state.text.trim() == "")) ||
                  (this.state.type != 3 &&
                    (!this.state.text || this.state.text.trim() == ""))
                }
                raised={true}
                onClick={this.onSubmit}
              >
                Submit
              </Dialog.FooterButton>
            </Dialog.Footer>
          </form>
        </Dialog>
        <Snackbar
          ref={snack => {
            this.snack = snack;
          }}
        />
      </div>
    );
  }
}

$.ajaxSetup({
  beforeSend: function(xhr, settings) {
    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
      xhr.setRequestHeader("X-CSRFToken", getCsrfToken());
    }
  }
});

function csrfSafeMethod(method) {
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

function getCsrfToken() {
  return document
    .getElementsByName("csrfmiddlewaretoken")[0]
    .getAttribute("value");
}

function postFeedback(component) {
  $.post(window.location.origin + "/feedback/post", {
    json: JSON.stringify(component.state)
  })
    .done(function(data) {
      if (data.action == "posted") {
        component.snack.MDComponent.show({
          message: component.props.snackMessageOnSuccess
        });
      } else {
        component.snack.MDComponent.show({
          message: component.props.snackMessageOnFailure
        });
      }
    })
    .fail(function(data) {
      component.snack.MDComponent.show({
        message: component.props.snackMessageOnFailure
      });
    });
}

export function injectDialog(titleText, url, successMessage, failureMessage) {
  if (
    document.body.contains(document.getElementById("user-feedback-container"))
  ) {
    render(
      <DialogPage
        titleParam={titleText}
        logoUrl={url}
        snackMessageOnSuccess={successMessage}
        snackMessageOnFailure={failureMessage}
      />,
      document.getElementById("user-feedback-container")
    );
  }
}

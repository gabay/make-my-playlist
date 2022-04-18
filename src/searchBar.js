import debounce from "lodash/debounce";
import React from "react";
import Form from "react-bootstrap/Form";

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeDebounced = debounce(this.onChange, 500);
  }

  render() {
    return (
      <>
        <Form.Control
          onChange={(event) => this.onChangeDebounced(event.target.value)}
        />
      </>
    );
  }

  onChange(value) {
    this.props.onChange(value);
  }
}

import React from "react";
import Button from "react-bootstrap/Button";
import { smallsetImage, trim } from "./util";

export default class ClickableItem extends React.Component {
    // Render a button from the given name, images, and isActive.
    render() {
      return (
        <Button
          variant="outline-dark"
          active={this.props.isActive}
          style={{ width: "8rem", boxShadow: "none" }}
          onClick={() => this.props.onClick()}
        >
          {this.renderImage()}
          <h5>{trim(this.props.name, 30)}</h5>
        </Button>
      );
    }
  
    renderImage() {
      if (this.props.images === undefined) {
        return <></>;
      } else {
        const image = smallsetImage(this.props.images);
        const imageSrc = image !== null ? image.url : "placeholder.png";
        return (
          <img width="64" height="64" className="rounded" src={imageSrc} alt="" />
        );
      }
    }
  }
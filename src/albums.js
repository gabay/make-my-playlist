import React from "react";
import InProgress from "./inProgress";
import FlexWrap from "./flexWrap";
import ClickableItem from "./clickableItem";

export default function Albums(props) {
  if (props.albums === undefined) {
    return <InProgress/>;
  } else {
    return (
    <FlexWrap>
        {props.albums.map((album, index) => (
        <ClickableItem
            key={index}
            name={album.name}
            images={album.images}
            isActive={props.pickedAlbum === album}
            onClick={() => props.onClick(index)}
        />
        ))}
    </FlexWrap>
    );
  }
}

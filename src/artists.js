import React from "react";
import ClickableItem from "./clickableItem";
import FlexWrap from "./flexWrap";
import InProgress from "./inProgress";
export default function Artists(props) {
  if (props.artists === undefined) {
    return <InProgress />;
  } else {
    return (
      <FlexWrap>
        {props.artists.map((artist, index) => (
          <ClickableItem
            key={index}
            name={artist.name}
            images={artist.images}
            isActive={props.pickedArtists.includes(artist)}
            onClick={() => props.onClick(index)}
          />
        ))}
      </FlexWrap>
    );
  }
}

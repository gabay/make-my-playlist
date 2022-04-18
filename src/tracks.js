import React from "react";
import InProgress from "./inProgress";
import FlexWrap from "./flexWrap";
import ClickableItem from "./clickableItem";

export default function Tracks(props) {
  if (props.tracks === undefined) {
    return <InProgress />;
  } else {
    return (
      <FlexWrap>
        {props.tracks.map((track, index) => (
          <ClickableItem
            key={index}
            name={track.name}
            isActive={props.pickedTracks.includes(track)}
            onClick={() => props.onClick(index)}
          />
        ))}
      </FlexWrap>
    );
  }
}
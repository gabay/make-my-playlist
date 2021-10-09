import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import React, { CSSProperties } from "react";
import Button from "react-bootstrap/Button";

const SliderWithTooltip = Slider.createSliderWithTooltip(Slider);

export interface FeatureButtonProps {
  title: string,
  style: CSSProperties,
  onClick: () => void
};
export function FeatureButton(props: FeatureButtonProps) {
  return (
    <div>
      <Button
        variant="light"
        style={props.style}
        onClick={() => props.onClick()}
      >
        {props.title}
      </Button>
    </div>
  );
}
FeatureButton.defaultProps = {
  style: { boxShadow: "none" },
  onClick: () => {},
};

export interface FeatureSliderProps {
  min: number,
  max: number,
  step?: number,
  defaultValue?: number,
  format?: (value: number) => number,
  style?: CSSProperties,
  onChange: (value: number) => void
};
export function FeatureSlider(props: FeatureSliderProps) {
  const step = props.step || (props.max - props.min) / 100;
  const defaultValue = props.defaultValue || (props.min + props.max) / 2;
  const format = props.format || ((value) => Math.round((value * 100) / props.max));
  const marks = {
    [props.min]: format(props.min),
    [props.max]: format(props.max),
  };
  return (
    <>
      <SliderWithTooltip
        style={props.style}
        min={props.min}
        max={props.max}
        step={step}
        defaultValue={defaultValue}
        marks={marks}
        tipFormatter={format}
        onAfterChange={(value) => props.onChange(value)}
      />
      <br />
    </>
  );
}
FeatureSlider.defaultProps = {
  min: 0,
  max: 1,
  style: { width: "100px", margin: "auto" },
  onChange: (value: number) => {},
};

export interface FeatureSliderWithToggleButtonProps {
  title: string,
  min: number,
  max: number,
  step?: number,
  format?: (value: number) => number,
  defaultValue?: number,
  onChange: (enabled: boolean, value: number) => {},
  show: boolean,
  style: CSSProperties,
}
interface FeatureSliderWithToggleButtonState {
  enabled: boolean,
  value: number
}
export default class FeatureSliderWithToggleButton extends React.Component<FeatureSliderWithToggleButtonProps, FeatureSliderWithToggleButtonState> {
  defaultProps = {
    min: 0,
    max: 1,
    onChange: (enabled: boolean, value: number) => {},
    show: false,
    style: { width: "100px", margin: "auto" },
  };

  constructor(props: FeatureSliderWithToggleButtonProps) {
    super(props);

    const defaultValue = props.defaultValue || (props.min + props.max) / 2;
    this.state = { enabled: false, value: defaultValue };
  }

  render() {
    return (
      <>
        <FeatureButton
          title={this.props.title}
          onClick={() => this.onClick()}
        />
        {this.state.enabled ? this.renderSlider() : null}
      </>
    );
  }

  renderSlider() {
    return (
      <FeatureSlider
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
        defaultValue={this.state.value}
        format={this.props.format}
        onChange={(value) => this.onSliderChange(value)}
      />
    );
  }

  onClick() {
    this.props.onChange(!this.state.enabled, this.state.value);
    this.setState({ enabled: !this.state.enabled });
  }

  onSliderChange(value: number) {
    this.props.onChange(this.state.enabled, value);
    this.setState({ value: value });
  }
}

import React from "react";
import "./spinner.css";

const Spinner = ({
  size,
  classNames = "",
  color = "#545ae6",
  marginTop = "auto",
}: {
  size?: number | string;
  classNames?: string;
  color?: string;
  marginTop?: string;
}): JSX.Element => {
  return (
    <svg
      className={`spinner stroke-current`}
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: color, marginTop: marginTop }}
    >
      <circle
        className="path"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      />
    </svg>
  );
};

export default Spinner;

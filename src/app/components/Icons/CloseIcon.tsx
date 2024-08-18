export const CloseIcon = ({
    size = "40",
    color = "#A04000",
  }: {
    size?: string;
    color?: string;
  }): JSX.Element => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.2579 20.3536L27.2929 26.3886L26.3886 27.2929L20.3536 21.2579L20 20.9043L19.6464 21.2579L13.6114 27.2929L12.7071 26.3886L18.7421 20.3536L19.0957 20L18.7421 19.6464L12.7071 13.6114L13.6114 12.7071L19.6464 18.7421L20 19.0957L20.3536 18.7421L26.3886 12.7071L27.2929 13.6114L21.2579 19.6464L20.9043 20L21.2579 20.3536Z"
          fill={color}
          stroke={color}
        />
      </svg>
    );
  };
  
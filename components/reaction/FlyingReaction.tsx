import classes from "./index.module.css";

type Props = {
  x: number;
  y: number;
  timestamp: number;
  value: string;
};

export default function FlyingReaction({ x, y, timestamp, value }: Props) {
  return (
    <div style={{ left: x, top: y }} className={`pointer-events-none absolute select-none ${classes.disappear} text-${(timestamp % 5) + 2}xl ${classes["goUp" + (timestamp % 3)]}`}>
      <div className={classes["leftRight" + (timestamp % 3)]}>
        <div className="-translate-x-1/2 -translate-y-1/2 transform">
          {value}
        </div>
      </div>
    </div>
  );
}
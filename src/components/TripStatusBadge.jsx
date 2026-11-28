import Badge from "./Badge";

const STATUS_TONES = {
  SCHEDULED: { tone: "neutral" },
  CONFIRMED: { tone: "success" },
  LEFT_ORIGIN: { tone: "warning" },
  ARRIVED_DESTINATION: { tone: "warning" },
  LEFT_DESTINATION: { tone: "warning" },
  ARRIVED_ORIGIN: { tone: "warning" },
  COMPLETED: { tone: "neutral", className: "bg-primary/10 text-primary" },
};

export default function TripStatusBadge({ status, label }) {
  const config = STATUS_TONES[status] || STATUS_TONES.SCHEDULED;
  return (
    <Badge tone={config.tone} className={config.className}>
      {label}
    </Badge>
  );
}

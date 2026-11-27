import { Check } from "lucide-react";
import { formatDateTime } from "../lib/dateTime";
import {
  STAGE_TIMES,
  TRIP_STAGES,
  delayInMinutes,
  formatDuration,
  stageIndex,
} from "../lib/tripStages";
import { cn } from "../lib/utils";
import ViagemService from "../services/ViagemService";

function DelayTag({ minutes }) {
  if (minutes === null) return null;
  if (minutes > 0) {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        {formatDuration(minutes)} de atraso
      </span>
    );
  }
  return (
    <span className="rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
      {minutes === 0 ? "No horário" : `${formatDuration(minutes)} adiantada`}
    </span>
  );
}

function StageTimes({ trip, stage, reached }) {
  const fields = STAGE_TIMES[stage];
  if (!fields) return null;

  const planned = trip[fields.planned];
  const actual = trip[fields.actual];

  if (!reached || !actual) {
    return (
      <p className="mt-1 text-sm text-muted-foreground">
        Previsto: {formatDateTime(planned)}
      </p>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="text-muted-foreground">Previsto: {formatDateTime(planned)}</span>
      <span className="font-medium text-foreground">Realizado: {formatDateTime(actual)}</span>
      <DelayTag minutes={delayInMinutes(planned, actual)} />
    </div>
  );
}

export default function TripTimeline({ trip }) {
  const current = stageIndex(trip.status);

  return (
    <ol aria-label="Etapas da viagem">
      {TRIP_STAGES.map((stage, index) => {
        const isDone = index < current || (index === current && index === TRIP_STAGES.length - 1);
        const isCurrent = index === current;
        const isLast = index === TRIP_STAGES.length - 1;

        return (
          <li
            key={stage}
            aria-current={isCurrent ? "step" : undefined}
            className={cn("relative flex gap-4", !isLast && "pb-6")}
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-8 bottom-0 left-4 w-px -translate-x-1/2",
                  index < current ? "bg-success/40" : "bg-border",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                isDone && !isCurrent && "border-success/30 bg-success/12 text-success",
                isCurrent && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
                !isDone && !isCurrent && "bg-card text-muted-foreground",
              )}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </span>

            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "text-sm",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : isDone
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {ViagemService.getStatusLabel(stage)}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Etapa atual
                  </span>
                )}
              </div>
              <StageTimes trip={trip} stage={stage} reached={index <= current} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

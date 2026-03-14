export type OperationStatus = "waiting" | "ready" | "done";

export interface Operation {
  id: number;
  type: "receipt" | "delivery";
  scheduledDate: string;
  status: OperationStatus;
}

export const operations: Operation[] = [
  {
    id: 1,
    type: "receipt",
    scheduledDate: "2026-03-10",
    status: "waiting",
  },
  {
    id: 2,
    type: "receipt",
    scheduledDate: "2026-03-15",
    status: "ready",
  },
  {
    id: 3,
    type: "delivery",
    scheduledDate: "2026-03-12",
    status: "waiting",
  },
  {
    id: 4,
    type: "delivery",
    scheduledDate: "2026-03-20",
    status: "ready",
  },
];
import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function LoadingSkeleton(props: { rows?: number; cols?: number }): ReactElement {
  const rows = props.rows ?? 6;
  const cols = props.cols ?? 5;
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <TableRow key={`sk-${ri}`}>
          {Array.from({ length: cols }).map((__, ci) => (
            <TableCell key={`sk-${ri}-${ci}`}>
              <Skeleton className="h-8 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

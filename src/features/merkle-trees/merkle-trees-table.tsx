import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { MerkleTree } from "@/app/blueprint/types";
import { dayjs } from "@/utils/date-time";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
} from "@/utils/formatting";

export const MerkleTreesTable = ({ trees }: { trees: MerkleTree[] }) => {
  const rerender = React.useReducer(() => ({}), {})[1];
  const [sorting, setSorting] = React.useState([]);
  const [formattedMerkleTrees, setFormattedMerkleTrees] = useState<
    MerkleTree[]
  >([]);

  useEffect(() => {
    if (trees?.length > 0) {
      setFormattedMerkleTrees(
        trees.map((tree) => {
          return {
            ...tree,
          };
        })
      );
    }
  }, [trees]);

  const columns = useMemo<ColumnDef<MerkleTree>[]>(
    () => [
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Created</div>,
        size: 30,
        accessorKey: "createdAt",
        cell: (info) => (
          <div className="flex space-x-4 px-4">
            <div>{`${dayjs(info.getValue() as Date).format(
              "MM/DD/YYYY"
            )} `}</div>
            <div className="text-gray-400">
              {dayjs(info.getValue() as Date).format("hh:mm:ss A")}
            </div>
          </div>
        ),
      },
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Address</div>,
        size: 24,
        accessorKey: "address",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <div>{`${getAbbreviatedAddress(info?.getValue() as string)}`}</div>
          </div>
        ),
      },
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Cluster</div>,
        size: 16,
        accessorKey: "cluster",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <div>{`${info?.getValue()}`}</div>
          </div>
        ),
      },
      {
        header: () => (
          <div className="uppercase py-2 mr-4 px-4">Total Capacity</div>
        ),
        size: 16,
        accessorKey: "maxCapacity",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <div>{`${formatNumberWithCommas(info?.getValue() as number)}`}</div>
          </div>
        ),
      },
    ],
    []
  );

  const [data, setData] = useState(formattedMerkleTrees);

  useEffect(() => {
    setData(formattedMerkleTrees);
  }, [formattedMerkleTrees]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    // @ts-ignore
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  return (
    <div className="w-full" style={{ padding: "0.5rem" }}>
      <div style={{ height: "0.5rem" }} />

      <TableVirtuoso
        style={{ height: "20vh", border: "1px solid lightgray" }}
        totalCount={rows.length}
        components={{
          Table: ({ style, ...props }) => {
            return (
              <table
                {...props}
                style={{
                  ...style,
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  borderSpacing: 0,
                }}
              />
            );
          },
          TableRow: (props) => {
            const index = props["data-index"];
            const row = rows[index];

            return (
              <tr {...props}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 mx-4 overflow-auto">
                    {
                      // <Link href={`/admin/merkle-tree/${row.original.id}`}>
                      <>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </>
                      // </Link>
                    }
                  </td>
                ))}
              </tr>
            );
          },
        }}
        fixedHeaderContent={() => {
          return table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className="text-xs"
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      padding: "2px 4px",
                      textAlign: "left",
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                      <div
                        className="flex items-center"
                        {...{
                          style: header.column.getCanSort()
                            ? { cursor: "pointer", userSelect: "none" }
                            : {},
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                          desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ));
        }}
      />
    </div>
  );
};

import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DynamicTable } from "./DynamicTable";

import { BREAKPOINTS } from "@/constants";

const offset = 100;

beforeAll(() => {
  // simulate top offset as JSDOM doesn't support getBoundingClientRect
  // - equivalent of another element of height 100px being displayed above the table
  vi.spyOn(
    window.HTMLElement.prototype,
    "getBoundingClientRect",
  ).mockReturnValue({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: offset,
    width: 0,
  } as DOMRect);
});

it("sets a fixed table body height based on top offset on large screens", async () => {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(BREAKPOINTS.xSmall);

  await act(async () => {
    fireEvent(window, new Event("resize"));
  });

  const { container } = render(
    <DynamicTable>
      <DynamicTable.Body className="test-class">
        <tr>
          <td>Test content</td>
        </tr>
      </DynamicTable.Body>
    </DynamicTable>,
  );

  const tbody = container.querySelector("tbody");

  await act(async () => {
    fireEvent(window, new Event("resize"));
  });

  // does not alter the height on small screens
  expect(tbody).toHaveStyle("height: undefined");

  vi.spyOn(window, "innerWidth", "get").mockReturnValue(BREAKPOINTS.large);

  await act(async () => {
    fireEvent(window, new Event("resize"));
  });

  await vi.waitFor(() =>
    expect(tbody).toHaveStyle(`height: calc(100vh - ${offset + 1}px)`),
  );
});

it("displays loading state", () => {
  const { container } = render(
    <DynamicTable>
      <DynamicTable.Loading />
    </DynamicTable>,
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(container.querySelector("tbody")).toHaveAttribute("aria-busy", "true");
  expect(screen.getAllByRole("row", { hidden: true })).toHaveLength(10);
});

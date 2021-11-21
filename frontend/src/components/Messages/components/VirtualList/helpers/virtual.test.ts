import { test } from "uvu";
import * as assert from "uvu/assert";

import Virtual, { Config, Range } from "./virtual";

function generateIds(count = 50) {
  return Array.from({ length: count + 1 }).map((_, i) => i.toString());
}

function generateHeights(count = 50) {
  const heights = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    heights.set(i.toString(), 120);
  }
  return heights;
}

test("should trigger onRange once and with empty data on initial render", () => {
  const VIRTUAL_LIST_PARAMS: Config = {
    keeps: 20,
    estimatedSize: 130,
    buffer: 10,
    uniqueIds: [],
  };

  const events: Range[] = [];
  const onChangeRange = (range: Range) => {
    events.push(range);
  };

  new Virtual(VIRTUAL_LIST_PARAMS, onChangeRange);

  assert.is(events.length, 1);
  assert.equal(events, [
    {
      start: 0,
      end: 0,
      padFront: 0,
      padBehind: 0,
    },
  ]);
});

test("paddings should be empty if a number of items less then a viewport size", () => {
  const itemsCount = 10;
  const VIRTUAL_LIST_PARAMS: Config = {
    keeps: 20,
    estimatedSize: 130,
    buffer: 10,
    uniqueIds: [],
  };

  const instance = new Virtual(VIRTUAL_LIST_PARAMS, () => {});
  const ids = generateIds(itemsCount);
  const heights = generateHeights(itemsCount);

  instance.onUpdateIds(ids);
  for (const [id, height] of heights) {
    instance.onSaveHeight(id, height);
  }
  instance.onRecalculateOffset();
  instance.onUpdateRange();

  assert.equal(instance.range, {
    start: 0,
    end: itemsCount,
    padFront: 0,
    padBehind: 0,
  });
});

test("should update range properly on the top position after getting a new data", () => {
  const itemsCount = 200;
  const VIRTUAL_LIST_PARAMS: Config = {
    keeps: 20,
    estimatedSize: 130,
    buffer: 10,
    uniqueIds: [],
  };

  const instance = new Virtual(VIRTUAL_LIST_PARAMS, () => {});
  const heights = generateHeights(itemsCount);
  const ids = generateIds(itemsCount);

  instance.onUpdateIds(ids);
  for (const [id, height] of heights) {
    instance.onSaveHeight(id, height);
  }
  instance.onRecalculateOffset();
  instance.onUpdateRange();

  assert.equal(
    { start: 0, end: 19, padFront: 0, padBehind: (itemsCount - 19) * 120 },
    instance.range,
  );
});

test("should update range accordingly to a scroll position changes", () => {
  const VIRTUAL_LIST_PARAMS: Config = {
    keeps: 20,
    estimatedSize: 130,
    buffer: 10,
    uniqueIds: [],
  };

  const events: Range[] = [];
  const onChangeRange = (range: Range) => {
    events.push(range);
  };

  const instance = new Virtual(VIRTUAL_LIST_PARAMS, onChangeRange);
  const heights = generateHeights(200);
  const ids = generateIds(200);

  instance.onUpdateIds(ids);
  for (const [id, height] of heights) {
    instance.onSaveHeight(id, height);
  }
  instance.onRecalculateOffset();
  instance.onUpdateRange();

  instance.onScroll(2000);
  instance.onScroll(4000);
  instance.onScroll(6000);

  const expectedEvents = [
    { start: 0, end: 0, padFront: 0, padBehind: 0 }, // initial onRange event
    { start: 0, end: 19, padFront: 0, padBehind: 21720 },
    { start: 16, end: 35, padFront: 1920, padBehind: 19800 },
    { start: 33, end: 52, padFront: 3960, padBehind: 17760 },
    { start: 50, end: 69, padFront: 6000, padBehind: 15720 },
  ];

  assert.equal(expectedEvents, events);
});

test("should recalculate range after scroll to the end of the list", () => {
  const itemsCount = 50;
  const VIRTUAL_LIST_PARAMS: Config = {
    keeps: 20,
    estimatedSize: 130,
    buffer: 10,
    uniqueIds: [],
  };

  const instance = new Virtual(VIRTUAL_LIST_PARAMS, () => {});
  const ids = generateIds(itemsCount);
  const heights = generateHeights(itemsCount);

  instance.onUpdateIds(ids);
  for (const [id, height] of heights) {
    instance.onSaveHeight(id, height);
  }
  instance.onRecalculateOffset();
  instance.onUpdateRange();

  instance.onScroll(itemsCount * 120);

  assert.equal(instance.range, {
    start: 31,
    end: itemsCount,
    padFront: 31 * 120,
    padBehind: 0,
  });
});

test.run();

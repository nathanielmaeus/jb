const DIRECTION = {
  UP: "UP",
  DOWN: "DOWN",
};

export type Range = {
  start: number;
  end: number;
  padFront: number;
  padBehind: number;
};

export type Config = {
  keeps: number;
  estimateSize: number;
  buffer: number;
  uniqueIds: string[];
};

export default class Virtual {
  private readonly config: Config;
  private readonly onUpdateRange: (v: Range) => void;

  private lastCalcIndex: number;
  private offset: number;
  private direction: string;
  private range: Range;

  heights: Map<string, number>;
  offsets: Map<string, number>;
  totalHeight: number | undefined;
  averageHeight: number;

  constructor(config: Config, onUpdateRange: (v: Range) => void) {
    this.config = config;
    this.onUpdateRange = onUpdateRange;

    this.heights = new Map();
    this.offsets = new Map();
    this.totalHeight = 0;
    this.averageHeight = 0;
    this.lastCalcIndex = 0;

    this.offset = 0;
    this.direction = "";

    this.range = {} as Range;
    this.checkRange(0, config.keeps - 1);
  }

  getRange() {
    const range = {} as Range;
    range.start = this.range.start;
    range.end = this.range.end;
    range.padFront = this.range.padFront;
    range.padBehind = this.range.padBehind;
    return range;
  }

  getOffset(start: number) {
    return start < 1 ? 0 : this.getOffsetByIndex(start);
  }

  onUpdateIds(newIds: string[]) {
    this.heights.forEach((v, key) => {
      if (!newIds.includes(key)) {
        this.heights.delete(key);
      }
    });
    this.config.uniqueIds = newIds;
  }

  onSaveHeight(id: string, size: number) {
    this.heights.set(id, size);

    if (typeof this.totalHeight !== "undefined") {
      if (
        this.heights.size <
        Math.min(this.config.keeps, this.config.uniqueIds.length)
      ) {
        this.totalHeight = [...this.heights.values()].reduce(
          (acc, val) => acc + val,
          0,
        );
        this.averageHeight = Math.round(this.totalHeight / this.heights.size);
      } else {
        delete this.totalHeight;
      }
    }
  }

  onUpdateData() {
    const start = Math.max(this.range.start, 0);
    this.updateRange(start, this.getEndByStart(start));
  }

  onScroll(newOffset: number) {
    this.direction = newOffset < this.offset ? DIRECTION.UP : DIRECTION.DOWN;
    this.offset = newOffset;

    if (this.direction === DIRECTION.UP) {
      this.handleScrollUp();
    } else if (this.direction === DIRECTION.DOWN) {
      this.handleScrollDown();
    }
  }

  handleScrollUp() {
    const overs = this.getCurrentRange();

    if (overs > this.range.start) {
      return;
    }

    const start = Math.max(overs - this.config.buffer, 0);
    this.checkRange(start, this.getEndByStart(start));
  }

  handleScrollDown() {
    const overs = this.getCurrentRange();

    if (overs < this.range.start + this.config.buffer) {
      return;
    }

    this.checkRange(overs, this.getEndByStart(overs));
  }

  getCurrentRange() {
    const offset = this.offset;
    if (offset <= 0) {
      return 0;
    }

    let low = 0;
    let middle = 0;
    let middleOffset = 0;
    let high = this.config.uniqueIds.length;

    while (low <= high) {
      middle = Math.floor((high + low) / 2);
      middleOffset = this.getOffsetByIndex(middle);

      if (middleOffset === offset) {
        return middle;
      } else if (middleOffset < offset) {
        low = middle + 1;
      } else if (middleOffset > offset) {
        high = middle - 1;
      }
    }

    return low > 0 ? low - 1 : 0;
  }

  getOffsetByIndex(givenIndex: number) {
    let offset = this.offsets.get(this.config.uniqueIds[givenIndex]);

    if (typeof offset !== "number") {
      offset = givenIndex * this.getAverageHeight();
    }

    this.lastCalcIndex = Math.max(this.lastCalcIndex, givenIndex - 1);
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex());

    return offset;
  }

  getLastIndex() {
    return this.config.uniqueIds.length - 1;
  }

  checkRange(start: number, end: number) {
    const keeps = this.config.keeps;
    const total = this.config.uniqueIds.length;

    if (total <= keeps) {
      start = 0;
      end = this.getLastIndex();
    } else if (end - start < keeps - 1) {
      start = end - keeps + 1;
    }

    if (this.range.start !== start) {
      this.updateRange(start, end);
    }
  }

  updateRange(start: number, end: number) {
    this.range.start = start;
    this.range.end = end;
    this.range.padFront = this.calculateTopPadding();
    this.range.padBehind = this.calculateBottomPadding();
    this.onUpdateRange(this.getRange());
  }

  getEndByStart(start: number) {
    const theoryEnd = start + this.config.keeps - 1;
    return Math.min(theoryEnd, this.getLastIndex());
  }

  calculateTopPadding() {
    return this.getOffsetByIndex(this.range.start);
  }

  calculateBottomPadding() {
    const end = this.range.end;
    const lastIndex = this.getLastIndex();

    if (this.lastCalcIndex === lastIndex) {
      return this.getOffsetByIndex(lastIndex) - this.getOffsetByIndex(end);
    } else {
      return (lastIndex - end) * this.getAverageHeight();
    }
  }

  getAverageHeight() {
    return this.averageHeight || this.config.estimateSize;
  }
}

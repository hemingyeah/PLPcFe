const PIXEL_STEP = 1;
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * 抹平浏览器之间wheel事件的差异
 * @param event - wheel事件对象
 * @see https://github.com/basilfx/normalize-wheel
 */
function normalizeWheel(event){
  let {deltaX, deltaY} = event;

  let unit = (
    event.deltaMode == 0 
      ? PIXEL_STEP 
      : event.deltaMode == 1 
        ? LINE_HEIGHT 
        : PAGE_HEIGHT
  );

  return {pixelX: deltaX * unit, pixelY: deltaY * unit};
}

export default normalizeWheel;
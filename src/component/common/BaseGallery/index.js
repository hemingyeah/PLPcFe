/** @see https://github.com/fengyuanchen/viewerjs */
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css';

function preview(element, currIndex, multiple){
  let viewer = null;
  let options = {
    navbar: multiple,
    initialViewIndex: currIndex,
    fullscreen: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      reset: true,
      oneToOne:true,
      prev: {
        show: multiple,
        size: 'large'
      },
      next: {
        show: multiple,
        size: 'large'
      },
      rotateLeft: true,
      rotateRight: true,
      flipHorizontal: true,
      flipVertical: true
    },
    url: 'data-origin',
    hidden(){
      viewer && viewer.destroy();
    }
  };

  viewer = new Viewer(element, options);
  viewer.show();

  return viewer;
}

const BaseGallery = { preview };
export default BaseGallery;
import { SMVPlugin } from './extern';

import music from './internal-plugins/music';
import imgView from './internal-plugins/img-view';

const plugins: SMVPlugin<{}>[] = [
    music, imgView
];

export default plugins;
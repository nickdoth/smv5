import { SMVPlugin } from '../extern';

import * as music from './music';
import * as imgView from './img-view';

const plugins: SMVPlugin<{}>[] = [
    music, imgView
];

export default plugins;
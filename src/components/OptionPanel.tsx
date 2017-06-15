import * as React from 'react';
import { StatelessComponent, MouseEvent } from 'react';

import { OptionPanelItem, OptionPanelProps } from '../extern';


export const OptionPanel: StatelessComponent<OptionPanelProps> = (props) => {
	var optionElems = props.options.map(option => {
		return <li onClick={() => option.action()}>
			<a href='javascript:;' target='_blank'>
				{option.name}
			</a>
		</li>;
	});

	return (
		<ul style={{ display: props.visible? null : 'none' }}>
			{optionElems}
			<li onClick={props.dismiss}>
				<a href='javascript:;'>
					取消
				</a>
			</li>
		</ul>
	);
}
/**
 * WordPress dependencies
 */
import {
	__experimentalAlignmentHookSettingsProvider as AlignmentHookSettingsProvider,
	InnerBlocks,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { name as buttonBlockName } from '../button/';

const ALLOWED_BLOCKS = [ buttonBlockName ];
const BUTTONS_TEMPLATE = [ [ 'core/button' ] ];

// Inside buttons block alignment options are not supported.
const alignmentHooksSetting = {
	isEmbedButton: true,
};

function ButtonsEdit() {
	return (
		<AlignmentHookSettingsProvider value={ alignmentHooksSetting }>
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				__experimentalTagName={ Block.div }
				template={ BUTTONS_TEMPLATE }
				__experimentalMoverDirection="horizontal"
			/>
		</AlignmentHookSettingsProvider>
	);
}

export default ButtonsEdit;

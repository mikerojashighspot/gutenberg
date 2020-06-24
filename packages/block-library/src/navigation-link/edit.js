/**
 * External dependencies
 */
import classnames from 'classnames';
import { get, head, find } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { createBlock } from '@wordpress/blocks';
import { displayShortcut, rawShortcut } from '@wordpress/keycodes';
import { withDispatch, withSelect } from '@wordpress/data';
import {
	ExternalLink,
	PanelBody,
	Popover,
	TextareaControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
	KeyboardShortcuts,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	RichText,
	__experimentalBlock as Block,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { Fragment, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ToolbarSubmenuIcon, ItemSubmenuIcon } from './icons';
import URLToolbar from './url-toolbar';

function NavigationLinkEdit( {
	attributes,
	hasDescendants,
	isSelected,
	isImmediateParentOfSelectedBlock,
	isParentOfSelectedBlock,
	setAttributes,
	showSubmenuIcon,
	insertLinkBlock,
	textColor,
	backgroundColor,
	rgbTextColor,
	rgbBackgroundColor,
	saveEntityRecord,
	selectedBlockHasDescendants,
	userCanCreatePages = false,
	insertBlocksAfter,
	mergeBlocks,
	onReplace,
} ) {
	const { label, url, opensInNewTab, nofollow, description } = attributes;
	const itemLabelPlaceholder = __( 'Add link…' );
	const ref = useRef();

	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	const link = {
		url,
		opensInNewTab,
	};
	async function handleCreatePage( pageTitle ) {
		const type = 'page';
		const page = await saveEntityRecord( 'postType', type, {
			title: pageTitle,
			status: 'publish',
		} );

		return {
			id: page.id,
			type,
			title: page.title.rendered,
			url: page.link,
		};
	}
	return (
		<Fragment>
			<BlockControls key="1">
				<ToolbarGroup eventToOffset={ () => undefined }>
					<KeyboardShortcuts
						bindGlobal
						shortcuts={ {
							[ rawShortcut.primary( 'k' ) ]: () =>
								setIsLinkOpen( true ),
						} }
					/>
					<ToolbarButton
						name="link"
						icon={ null }
						title={ url ? url : __( 'Set link' ) }
						shortcut={ displayShortcut.primary( 'k' ) }
						onClick={ () => setIsLinkOpen( true ) }
						className="navigation-link-edit-link-button"
					>
						<span className="navigation-link-edit-link-label">
							{ url ? __( 'Edit link' ) : __( 'Link' ) }
						</span>
					</ToolbarButton>
				</ToolbarGroup>
				<URLToolbar
					url={ url }
					opensInNewTab={ opensInNewTab }
					isOpen={ isLinkOpen }
					setOpen={ setIsLinkOpen }
					setAttributes={ setAttributes }
					popoverFactory={ ( { popoverRef } ) => (
						<Popover position="bottom center">
							<div ref={ popoverRef }>
								<LinkControl
									className="wp-block-navigation-link__inline-link-input"
									value={ link }
									createSuggestion={
										userCanCreatePages
											? handleCreatePage
											: undefined
									}
									inputValue={ url }
									onlySuggestions
									showInitialSuggestions
									forceIsEditingLink
									onChange={ ( {
										title: newTitle = '',
										url: newURL = '',
										id,
									} = {} ) => {
										if ( newURL && newURL !== url ) {
											setIsLinkOpen( false );
										}
										setAttributes( {
											url: encodeURI( newURL ),
											label: ( () => {
												const normalizedTitle = newTitle.replace(
													/http(s?):\/\//gi,
													''
												);
												const normalizedURL = newURL.replace(
													/http(s?):\/\//gi,
													''
												);
												if (
													newTitle !== '' &&
													normalizedTitle !==
														normalizedURL &&
													label !== newTitle
												) {
													return newTitle;
												} else if ( label ) {
													return label;
												}
												// If there's no label, add the URL.
												return normalizedURL;
											} )(),
											id,
										} );
									} }
								/>
							</div>
						</Popover>
					) }
				/>
				<ToolbarGroup>
					<ToolbarButton
						name="submenu"
						icon={ <ToolbarSubmenuIcon /> }
						title={ __( 'Add submenu' ) }
						onClick={ insertLinkBlock }
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'SEO settings' ) }>
					<ToggleControl
						checked={ nofollow }
						onChange={ ( nofollowValue ) => {
							setAttributes( { nofollow: nofollowValue } );
						} }
						label={ __( 'Add nofollow to link' ) }
						help={
							<Fragment>
								{ __(
									"Don't let search engines follow this link."
								) }
								<ExternalLink
									className="wp-block-navigation-link__nofollow-external-link"
									href={ __(
										'https://codex.wordpress.org/Nofollow'
									) }
								>
									{ __( "What's this?" ) }
								</ExternalLink>
							</Fragment>
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Link settings' ) }>
					<TextareaControl
						value={ description || '' }
						onChange={ ( descriptionValue ) => {
							setAttributes( { description: descriptionValue } );
						} }
						label={ __( 'Description' ) }
						help={ __(
							'The description will be displayed in the menu if the current theme supports it.'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<Block.li
				className={ classnames( {
					'is-editing': isSelected || isParentOfSelectedBlock,
					'is-selected': isSelected,
					'has-link': !! url,
					'has-child': hasDescendants,
					'has-text-color': rgbTextColor,
					[ `has-${ textColor }-color` ]: !! textColor,
					'has-background': rgbBackgroundColor,
					[ `has-${ backgroundColor }-background-color` ]: !! backgroundColor,
				} ) }
				style={ {
					color: rgbTextColor,
					backgroundColor: rgbBackgroundColor,
				} }
			>
				<div className="wp-block-navigation-link__content">
					<RichText
						ref={ ref }
						identifier="label"
						className="wp-block-navigation-link__label"
						value={ label }
						onChange={ ( labelValue ) =>
							setAttributes( { label: labelValue } )
						}
						onMerge={ mergeBlocks }
						onReplace={ onReplace }
						__unstableOnSplitAtEnd={ () =>
							insertBlocksAfter(
								createBlock( 'core/navigation-link' )
							)
						}
						placeholder={ itemLabelPlaceholder }
						keepPlaceholderOnFocus
						withoutInteractiveFormatting
						allowedFormats={ [
							'core/bold',
							'core/italic',
							'core/image',
							'core/strikethrough',
						] }
					/>
				</div>
				{ showSubmenuIcon && (
					<span className="wp-block-navigation-link__submenu-icon">
						<ItemSubmenuIcon />
					</span>
				) }
				<InnerBlocks
					allowedBlocks={ [ 'core/navigation-link' ] }
					renderAppender={
						( isSelected && hasDescendants ) ||
						( isImmediateParentOfSelectedBlock &&
							! selectedBlockHasDescendants )
							? InnerBlocks.DefaultAppender
							: false
					}
					__experimentalTagName="ul"
					__experimentalAppenderTagName="li"
					__experimentalPassedProps={ {
						className: classnames(
							'wp-block-navigation__container',
							{
								'is-parent-of-selected-block': isParentOfSelectedBlock,
							}
						),
					} }
				/>
			</Block.li>
		</Fragment>
	);
}

/**
 * Returns the color object matching the slug, or undefined.
 *
 * @param {Array}  colors      The editor settings colors array.
 * @param {string} colorSlug   A string containing the color slug.
 * @param {string} customColor A string containing the custom color value.
 *
 * @return {Object} Color object included in the editor settings colors, or Undefined.
 */
const getColorObjectByColorSlug = ( colors, colorSlug, customColor ) => {
	if ( customColor ) {
		return customColor;
	}

	if ( ! colors || ! colors.length ) {
		return;
	}

	return get( find( colors, { slug: colorSlug } ), 'color' );
};

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			getBlockAttributes,
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
			getBlockParentsByBlockName,
			getSelectedBlockClientId,
			getSettings,
		} = select( 'core/block-editor' );
		const { clientId } = ownProps;
		const rootBlock = head(
			getBlockParentsByBlockName( clientId, 'core/navigation' )
		);
		const navigationBlockAttributes = getBlockAttributes( rootBlock );
		const colors = get( getSettings(), 'colors', [] );
		const hasDescendants = !! getClientIdsOfDescendants( [ clientId ] )
			.length;
		const showSubmenuIcon =
			!! navigationBlockAttributes.showSubmenuIcon && hasDescendants;
		const isParentOfSelectedBlock = hasSelectedInnerBlock( clientId, true );
		const isImmediateParentOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			false
		);
		const selectedBlockId = getSelectedBlockClientId();
		const selectedBlockHasDescendants = !! getClientIdsOfDescendants( [
			selectedBlockId,
		] )?.length;

		const userCanCreatePages = select( 'core' ).canUser(
			'create',
			'pages'
		);

		return {
			isParentOfSelectedBlock,
			isImmediateParentOfSelectedBlock,
			hasDescendants,
			selectedBlockHasDescendants,
			showSubmenuIcon,
			textColor: navigationBlockAttributes.textColor,
			backgroundColor: navigationBlockAttributes.backgroundColor,
			userCanCreatePages,
			rgbTextColor: getColorObjectByColorSlug(
				colors,
				navigationBlockAttributes.textColor,
				navigationBlockAttributes.customTextColor
			),
			rgbBackgroundColor: getColorObjectByColorSlug(
				colors,
				navigationBlockAttributes.backgroundColor,
				navigationBlockAttributes.customBackgroundColor
			),
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		const { saveEntityRecord } = dispatch( 'core' );
		return {
			saveEntityRecord,
			insertLinkBlock() {
				const { clientId } = ownProps;

				const { insertBlock } = dispatch( 'core/block-editor' );

				const { getClientIdsOfDescendants } = registry.select(
					'core/block-editor'
				);
				const navItems = getClientIdsOfDescendants( [ clientId ] );
				const insertionPoint = navItems.length ? navItems.length : 0;

				const blockToInsert = createBlock( 'core/navigation-link' );

				insertBlock( blockToInsert, insertionPoint, clientId );
			},
		};
	} ),
] )( NavigationLinkEdit );

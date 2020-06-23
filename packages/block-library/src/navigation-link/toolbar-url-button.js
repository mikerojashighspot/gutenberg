/**
 * WordPress dependencies
 */
import {
	__experimentalToolbarItem as ToolbarItem,
	ToolbarButton,
	KeyboardShortcuts,
} from '@wordpress/components';
import { useRef, useCallback, useEffect, useState } from '@wordpress/element';
import { link as linkIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { displayShortcut, rawShortcut } from '@wordpress/keycodes';
/**
 * Internal dependencies
 */
import useDisplayUrl from './use-display-url';

export default function ToolbarUrlButton( { url, onChange, ...props } ) {
	const displayUrl = useDisplayUrl( url );
	const [ editUrl, setEditUrl ] = useState( displayUrl );
	const [ isLinkOpen, _setIsLinkOpen ] = useState( false );
	const inputRef = useRef();
	const setIsLinkOpen = ( value ) => {
		setEditUrl( displayUrl );
		_setIsLinkOpen( value );
		setTimeout( () => {
			if ( inputRef.current ) {
				inputRef.current.focus();
			}
		} );
	};

	const handleFinish = useCallback( () => {
		onChange( editUrl );
		setIsLinkOpen( false );
		if ( inputRef.current ) {
			inputRef.current.blur();
		}
	}, [ editUrl ] );

	// Show the LinkControl on mount if the URL is empty
	// ( When adding a new menu item)
	// This can't be done in the useState call because it cconflicts
	// with the autofocus behavior of the BlockListBlock component.
	useEffect( () => {
		if ( ! url ) {
			setIsLinkOpen( true );
		}
	}, [] );
	//
	// // If the LinkControl popover is open and the URL has changed, close the LinkControl and focus the label text.
	// useEffect( () => {
	// 	return;
	// 	if ( isLinkOpen && url ) {
	// 		// Does this look like a URL and have something TLD-ish?
	// 		if (
	// 			isURL( prependHTTP( label ) ) &&
	// 			/^.+\.[a-z]+/.test( label )
	// 		) {
	// 			// Focus and select the label text.
	// 			selectLabelText();
	// 		} else {
	// 			// Focus it (but do not select).
	// 			placeCaretAtHorizontalEdge( ref.current, true );
	// 		}
	// 	}
	// }, [ url ] );
	//
	// /**
	//  * Focus the Link label text and select it.
	//  */
	// function selectLabelText() {
	// 	ref.current.focus();
	// 	const selection = window.getSelection();
	// 	const range = document.createRange();
	// 	// Get the range of the current ref contents so we can add this range to the selection.
	// 	range.selectNodeContents( ref.current );
	// 	selection.removeAllRanges();
	// 	selection.addRange( range );
	// }

	if ( ! isLinkOpen ) {
		return (
			<>
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						[ rawShortcut.primary( 'k' ) ]: () =>
							setIsLinkOpen( true ),
					} }
				/>
				<ToolbarButton
					name="link"
					icon={ displayUrl ? null : linkIcon }
					title={ __( 'Link' ) }
					shortcut={ displayShortcut.primary( 'k' ) }
					onClick={ () => setIsLinkOpen( true ) }
					className="navigation-link-edit-link-button"
				>
					<span className="navigation-link-edit-link-label">
						{ displayUrl }
					</span>
				</ToolbarButton>
			</>
		);
	}

	return (
		<ToolbarItem ref={ inputRef }>
			{ ( toolbarItemProps ) => (
				<input
					type="text"
					placeholder={ 'Link address' }
					className="navigation-link-edit-link-rich-text"
					value={ editUrl }
					{ ...toolbarItemProps }
					onChange={ ( e ) => {
						setEditUrl( e.currentTarget.value );
					} }
					onBlur={ () => {
						handleFinish();
					} }
					onKeyDown={ ( e ) => {
						if ( e.which === 13 ) {
							handleFinish();
						}
					} }
					onKeyUp={ ( e ) => {
						if ( e.which === 13 ) {
							handleFinish();
						}
					} }
				/>
			) }
		</ToolbarItem>
	);
}

/*
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
					{ false && isLinkOpen && (
						<Popover
							position="bottom center"
							onClose={ () => setIsLinkOpen( false ) }
						>
							<LinkControl
								className="wp-block-navigation-link__inline-link-input"
								value={ link }
								showInitialSuggestions={ true }
								createSuggestion={
									userCanCreatePages
										? handleCreatePage
										: undefined
								}
								onChange={ ( {
									title: newTitle = '',
									url: newURL = '',
									opensInNewTab: newOpensInNewTab,
									id,
								} = {} ) =>
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
												return escape( newTitle );
											} else if ( label ) {
												return label;
											}
											// If there's no label, add the URL.
											return escape( normalizedURL );
										} )(),
										opensInNewTab: newOpensInNewTab,
										id,
									} )
								}
							/>
						</Popover>
					) }
 */

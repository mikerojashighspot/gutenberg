/**
 * External dependencies
 */
import { useTransition, animated } from 'react-spring/web.cjs';

/**
 * WordPress dependencies
 */
import {
	ToolbarButton,
	ToolbarGroup,
	__experimentalToolbarItem as ToolbarItem,
} from '@wordpress/components';
import { external as externalIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useDisplayUrl from './use-display-url';

export default function URLToolbar( { url, isOpen, setOpen, setAttributes } ) {
	const displayUrl = useDisplayUrl( url );
	const [ editUrl, setEditUrl ] = useState( displayUrl );

	const ref = useRef();
	const inputRef = useRef();
	const popoverRef = useRef();

	useEffect( () => {
		if ( isOpen ) {
			setEditUrl( displayUrl );
			// @TODO: This function steals focus from the popover.
			//        Let's make sure the popover isn't getting focused in the first place
			setTimeout( () => {
				if ( inputRef.current ) {
					inputRef.current.focus();
				}
			}, 100 );
		}
	}, [ isOpen ] );

	const finishLinkEditing = ( acceptChanges = true ) => {
		if ( acceptChanges ) {
			setAttributes( { url: editUrl } );
		}
		setOpen( false );
	};

	// const link = {
	// 	url,
	// 	opensInNewTab,
	// };
	// Show the LinkControl on mount if the URL is empty
	// ( When adding a new menu item)
	// This can't be done in the useState call because it cconflicts
	// with the autofocus behavior of the BlockListBlock component.
	useEffect( () => {
		if ( ! url ) {
			// startLinkEditing( true );
		}
	}, [] );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		const listener = function ( e ) {
			const root = ref.current;
			const popover = popoverRef.current;
			if (
				root !== e.target &&
				! root?.contains( e.target ) &&
				popover !== e.target &&
				! popover?.contains( e.target )
			) {
				finishLinkEditing( false );
			}
		};
		document.addEventListener( 'mousedown', listener, false );
		document.addEventListener( 'focus', listener, true );

		return function () {
			document.removeEventListener( 'mousedown', listener );
			document.removeEventListener( 'focus', listener );
		};
	}, [ isOpen ] );

	const transitions = useTransition( isOpen, null, {
		from: { position: 'absolute', opacity: 0, left: '50%' },
		enter: { opacity: 1, left: '0%', right: '0%' },
		leave: { opacity: 0, left: '50%', right: '50%' },
	} );

	return transitions.map(
		( { item, key, props } ) =>
			item && (
				<animated.div
					key={ key }
					style={ props }
					ref={ ref }
					className="block-editor-block-toolbar__slot navigation-link-edit__toolbar-link-pane"
				>
					{ /* @TODO use URLInput? */ }
					<ToolbarGroup className="navigation-link-edit__toolbar-link-input-group">
						<ToolbarItem ref={ inputRef }>
							{ ( toolbarItemProps ) => (
								<input
									{ ...toolbarItemProps }
									type="text"
									placeholder={ 'Link address' }
									className="navigation-link-edit__toolbar-link-input"
									value={ editUrl }
									onChange={ ( e ) => {
										setEditUrl( e.currentTarget.value );
									} }
									onKeyDown={ ( e ) => {
										if ( e.which === 13 ) {
											finishLinkEditing( true );
										}
										if ( e.which === 27 ) {
											finishLinkEditing( false );
										}
									} }
									onKeyUp={ ( e ) => {} }
								/>
							) }
						</ToolbarItem>
						<ToolbarButton
							name="new-window"
							icon={ externalIcon }
							title={ __( 'Open in new window' ) }
							onClick={ () => {
								const win = window.open( editUrl, '_blank' );
								win.focus();
							} }
						/>
					</ToolbarGroup>
					<ToolbarGroup>
						<ToolbarButton
							name="done"
							title={ __( 'Done' ) }
							onClick={ () => finishLinkEditing( true ) }
							className="navigation-link-edit-link-done"
						>
							Done
						</ToolbarButton>
					</ToolbarGroup>
				</animated.div>
			)
	);
}

/*<Popover position="bottom center">
	<div ref={ popoverRef }>
		<LinkControl
			className="wp-block-navigation-link__inline-link-input"
			value={ editUrl }
			showInitialSuggestions={ true }
			createSuggestion={
				userCanCreatePages
					? handleCreatePage
					: undefined
			}
			inputValue={ editUrl }
			onlySuggestions
			onChange={ ( {
				title: newTitle = '',
				url: newURL = '',
				opensInNewTab: newOpensInNewTab,
				id,
			} = {} ) => {
				finishLinkEditing( true );
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
					opensInNewTab: newOpensInNewTab,
					id,
				} );
			} }
		/>
	</div>
</Popover>*/

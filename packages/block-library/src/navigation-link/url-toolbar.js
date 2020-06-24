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

export default function URLToolbar( {
	url,
	opensInNewTab,
	isOpen,
	setOpen,
	setAttributes,
	popoverFactory,
} ) {
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
		if ( 1 || ! isOpen ) {
			return;
		}

		const listener = function ( e ) {
			const urlToolbar = ref.current;
			const rootToolbar = findParent( urlToolbar, ( node ) =>
				node.classList.contains( '.block-editor-block-toolbar' )
			);
			const toolbar = rootToolbar || urlToolbar;
			const popover = popoverRef.current;
			if (
				toolbar !== e.target &&
				! toolbar?.contains( e.target ) &&
				popover !== e.target &&
				! popover?.contains( e.target )
			) {
				finishLinkEditing( false );
			}
		};
		document.addEventListener( 'mousedown', listener );
		// document.addEventListener( 'focus', listener, true );

		return function () {
			document.removeEventListener( 'mousedown', listener );
			// document.removeEventListener( 'focus', listener, true );
		};
	}, [ isOpen ] );

	const transitions = useTransition( isOpen, null, {
		from: { position: 'absolute', opacity: 0, left: '50%' },
		enter: { opacity: 1, left: '0%', right: '0%' },
		leave: { opacity: 0, left: '50%', right: '50%' },
	} );

	return transitions.map(
		( { item, key, props, state } ) =>
			item && (
				<div
					className="block-editor-block-toolbar__slot block-editor-block-toolbar__overlay"
					key={ key }
				>
					<animated.div
						style={ props }
						ref={ ref }
						className="block-editor-block-toolbar__overlay-content"
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
								title={ __( 'Opens in new window' ) }
								className={ opensInNewTab ? 'is-active' : '' }
								onClick={ () => {
									setAttributes( {
										opensInNewTab: ! opensInNewTab,
									} );
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
					{ state !== 'leave' &&
						popoverFactory &&
						popoverFactory( { popoverRef } ) }
				</div>
			)
	);
}

const findParent = ( node, predicate ) => {
	while ( node && node !== document.body ) {
		if ( predicate( node ) ) {
			return node;
		}
		node = node.parentNode;
	}
	return null;
};

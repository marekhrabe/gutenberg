/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createRef } from '@wordpress/element';

class WidgetEditDomManager extends Component {
	constructor() {
		super( ...arguments );

		this.containerRef = createRef();
		this.formRef = createRef();
		this.widgetContentRef = createRef();
		this.triggerWidgetEvent = this.triggerWidgetEvent.bind( this );
	}

	componentDidMount() {
		this.triggerWidgetEvent( 'widget-added' );
	}

	shouldComponentUpdate( nextProps ) {
		// We can not leverage react render otherwise we would destroy dom changes applied by the plugins.
		// We manually update the required dom node replicating what the widget screen and the customizer do.
		if ( nextProps.form !== this.props.form && this.widgetContentRef.current ) {
			const widgetContent = this.widgetContentRef.current;
			widgetContent.innerHTML = nextProps.form;
			this.triggerWidgetEvent( 'widget-updated' );
		}
		return false;
	}

	render() {
		const { id, idBase, widgetNumber, form } = this.props;
		return (
			<div className="widget open" ref={ this.containerRef }>
				<div className="widget-inside">
					<form
						ref={ this.formRef }
						method="post"
						onBlur={ () => {
							//console.log( 'blur' );
						} }
					>
						<div
							ref={ this.widgetContentRef }
							className="widget-content"
							dangerouslySetInnerHTML={ { __html: form } }
						/>
						<input type="hidden" name="widget-id" className="widget-id" value={ id } />
						<input type="hidden" name="id_base" className="id_base" value={ idBase } />
						<input type="hidden" name="widget_number" className="widget_number" value={ widgetNumber } />
						<input type="hidden" name="multi_number" className="multi_number" value="" />
						<input type="hidden" name="add_new" className="add_new" value="" />
					</form>
				</div>
			</div>
		);
	}

	triggerWidgetEvent( event ) {
		window.$( window.document ).trigger(
			event,
			[ window.$( this.containerRef.current ) ]
		);
	}

	retrieveUpdatedInstance() {
		if ( this.formRef.current ) {
			const { idBase, widgetNumber } = this.props;
			const form = this.formRef.current;
			const formData = new window.FormData( form );
			const updatedInstance = {};
			const keyPrefixLength = `widget-${ idBase }[${ widgetNumber }][`.length;
			const keySuffixLength = `]`.length;
			for ( const rawKey of formData.keys() ) {
				// This fields are added to the form because the widget JavaScript code may use this values.
				// They are not relevant for the update mechanism.
				if ( includes(
					[ 'widget-id', 'id_base', 'widget_number', 'multi_number', 'add_new' ],
					rawKey,
				) ) {
					continue;
				}
				const keyParsed = rawKey.substring( keyPrefixLength, rawKey.length - keySuffixLength );

				const value = formData.getAll( rawKey );
				if ( value.length > 1 ) {
					updatedInstance[ keyParsed ] = value;
				} else {
					updatedInstance[ keyParsed ] = value[ 0 ];
				}
			}
			return updatedInstance;
		}
	}
}

export default WidgetEditDomManager;


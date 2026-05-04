import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit() {

	const blockProps = useBlockProps({
		className: 'ims-filters-editor'
	});

	return (
		<div {...blockProps}>

			<div className="ims-filters">

				<div className="ims-filters__row">

					<select data-filter="category">
						<option value="">
							{__('Sektor', 'filters')}
						</option>
					</select>

					<select data-filter="subcategory">
						<option value="">
							{__('Podsektor', 'filters')}
						</option>
					</select>

					<select data-filter="client">
						<option value="">
							{__('Klient', 'filters')}
						</option>
					</select>

					<select data-filter="support">
						<option value="">
							{__('Zakres wsparcia', 'filters')}
						</option>
					</select>

					<select data-filter="year">
						<option value="">
							{__('Rok', 'filters')}
						</option>
					</select>

				</div>

				<div className="ims-results">
					<p>{__('Lista projektów pojawi się tutaj na froncie.', 'filters')}</p>
				</div>

				<div className="ims-pagination">
					<button disabled>1</button>
					<button disabled>2</button>
					<button disabled>3</button>
				</div>

			</div>

		</div>
	);
}
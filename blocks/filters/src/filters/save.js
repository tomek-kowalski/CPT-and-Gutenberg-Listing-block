import { useBlockProps } from '@wordpress/block-editor';

export default function save() {
	return (
		<div {...useBlockProps.save()} className="wp-block-ims-filters">

			<div className="ims-filters">

				<div className="ims-filters__row">

					<select data-filter="category"></select>
					<select data-filter="subcategory"></select>
					<select data-filter="client"></select>
					<select data-filter="support"></select>
					<select data-filter="year"></select>

				</div>

				<div data-results className="ims-results"></div>

				<div data-pagination className="ims-pagination"></div>

			</div>

		</div>
	);
}

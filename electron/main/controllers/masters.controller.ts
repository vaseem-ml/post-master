import { uniq } from 'lodash';
import { model, Schema } from 'mongoose';

const masterSchema = new Schema(
	{
		facility_id: {
			type: String,
			unique: true,
			required: true,
		},
		pincode: {
			type: String,
			allownull: true,
			required: false,
		},

		booking_office: {
			type: String,
			allownull: true,
			required: false,
		},
		office_name: {
			type: String,
			allownull: true,
			required: false
		},
		division: {
			type: String,
			allownull: true,
			required: false,
		},
		region: {
			type: String,
			allownull: true,
			required: false,
		},
		d1: {
			type: String,
			allownull: true,
			required: false,
		},
		d2: {
			type: String,
			allownull: true,
			required: false,
		},
		is_deleted: {
			type: Boolean,
			default: false,
			allownull: false,
			required: true
		},
		is_active: {
			type: Boolean,
			default: true,
			allownull: false,
			required: true
		},
	},
	{
		timestamps: true,
	}
);


const master = model('master', masterSchema);

export default master;
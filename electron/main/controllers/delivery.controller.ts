import { model, Schema } from 'mongoose';

const deliverySchema = new Schema(
	{
		article: {
			type: String,
			required: true
		},
		booking: {
			type: String
		},
		track: {
			type: String
		},
		cod: {
			type: String
		},
		book_ofc: {
			type: String
		},
		book_ofc_name: {
			type: String
		},
		dest_ofc_id: {
			type: String
		},
		dest_ofc_name: {
			type: String
		},
		book_id: {
			type: String
		},
		article_type: {
			type: String
		},
		weight: {
			type: String
		},
		book_date: {
			type: Date
		},
		book_time: {
			type: String
		},
		tariff: {
			type: String
		},
		prepaid_value: {
			type: String
		},
		sender_name: {
			type: String
		},
		sender_city: {
			type: String
		},
		sender_mobile: {
			type: String
		},
		receiver_name: {
			type: String
		},
		recevier_addr1: {
			type: String
		},
		recevier_addr2: {
			type: String
		},
		recevier_addr3: {
			type: String
		},
		receiver_city: {
			type: String
		},
		receiver_phone: {
			type: String
		},
		receiver_pin: {
			type: String
		},
		ins_value: {
			type: String
		},
		customer_id: {
			type: String
		},
		contract: {
			type: String
		},
		value: {
			type: String
		},
		service: {
			type: String
		},
		emo_message: {
			type: String
		},
		user_id: {
			type: String
		},
		user_name: {
			type: String
		},
		status: {
			type: String
		},
		office_id: {
			type: String
		},
		office_name: {
			type: String,
		},
		event_date: {
			type: Date,
		},
		event_time: {
			type: String
		},
		ipvs_article_type: {
			type: String
		},
		bagid: {
			type: String
		},
		rts: {
			type: String
		}
	},
	{
		timestamps: true,
	}
);


const delivery = model('delivery', deliverySchema);

export default delivery;
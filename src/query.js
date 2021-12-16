/**
 * @param {*} service
 * @param {} ids
 * @param {} widget 
 * @returns 
 */
const queryAnnotationSize = ({ service, ids, widget }) => {
	const tmService = new imjs.Service(service);
	let query = {
		from: 'Gene',
		select: ['primaryIdentifier']
	};
	if (ids!== undefined) {
		query['where'] = [
			{	path: widget.enrichIdentifier, op:'IS NOT NULL', values: 'IS NOT NULL', code: 'A'},
			{ path: 'id', op: 'one of', values: ids, code: 'B' }
		];
		query['constraintLogic'] = 'A and B';
	}
	else{
		query['where'] = [{ path: widget.enrichIdentifier, op:'IS NOT NULL', values: 'IS NOT NULL', code: 'A'}];
	}
	return new Promise((resolve, reject) => {
		tmService.count(query)
			.then(size => resolve(size))
			.catch(() => reject(-1));
	});
}

/**
 * @param {Object} service
 * @param {Array<Number>} ids
 * @param {Object} widget 
 * @param {} correction
 * @param {} maxp
 * @param {} filter
 * @returns Promise 
 */
 const queryEnrichmentData = ({ service, ids, widget, correction, maxp, filter }) => {
	const tmService = new imjs.Service(service);
	return new Promise((resolve,reject) => {
		if(filter !== undefined){
			tmService.enrichment({ ids, widget: widget.name, maxp, correction, filter })
			.then(data => resolve(data))
			.catch(() => reject('No enrichment data found!'));
		}
		else{
			tmService.enrichment({ ids, widget: widget.name, maxp, correction })
			.then(data => resolve(data))
			.catch(() => reject('No enrichment data found!'));
		}
	});
}

/**
 * Filter the list of genes to include only elements that belong to the
 * specified organism
 * @param {Object} service object describing an intermine service
 * @param {Array<Number>} genes the complete list of genes
 * @param {String} organism the target organism used to filter the list of genes
 */
const queryGeneList = ({ service, genes, organism }) => {
	const tmService = new imjs.Service(service);
	const query = {
		from: 'Gene',
		select: ['primaryIdentifier'],
		where: [
			{ path: 'id', op: 'one of', values: genes, code: 'A' },
			{ path: 'organism.shortName', op: '=', value: organism, code: 'B' }
		],
		constraintLogic: 'A and B'
	};
	return new Promise((resolve, reject) => {
		tmService.records(query)
			.then(res => resolve(res.map(item => item.objectId)))
			.catch(() => reject('No matching IDs'));
	});
};

/** 
 * Retrieve a filtered list of widgets from the service
 * @param {object} service intermine service
 * @param {String} type Type of enrichment widget we wish to retain
 * @param {String} cls Target class for enrichment widget we wish to retain
 * 
*/
const queryWidgets = ({ service, type, cls }) => {
	const tmService = new imjs.Service(service);
	return new Promise((resolve, reject) => {
		tmService.fetchWidgets()
			.then(res => {
				if (res.length === 0) reject('No widgets data found!');
				let filteredWidgets = res.filter( w =>
					w.widgetType === type &&
					w.targets.indexOf(cls) !== -1
				);
				resolve(filteredWidgets);
			})
			.catch(() => reject('No widgets data found!'));
	});
};

export { queryAnnotationSize, queryEnrichmentData, queryGeneList, queryWidgets };
export const provider = (state = {}, action) => {
	switch(action.type) {
		case 'PROVIDER_LOADED':
		return {
			...state,
			connection: action.connection
		} 

		default:
			return state
	} 
}


export const tokens = (state = { loaded: false, contracts: [], symbols: []}, action) => {
	switch(action.type) {
		case 'TOKEN_1_LOADED':
			return {
				...state,
				loaded: true,
				contracts: [...state.contracts, action.token],
				symbols: [...state.symbols, action.symbol]
			}
		case 'TOKEN_2_LOADED':
			return {
				...state,
				loaded: true,
				contracts: [...state.contracts, action.token],
				symbols: [...state.symbols, action.symbol]
			}
		default:
			return state
	}
}

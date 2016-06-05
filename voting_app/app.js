// Creating class that extends React.Component
// Other way: 
// class ProductList extends React.Component {}
const ProductList = React.createClass({
    getInitialState: function () { // lifecycle method
        return {
            products: [],
            sortAsc: true
        }
    },
    componentDidMount: function () { // lifecycle method
        this.updateProducts();
    },
    updateProducts: function (toggle) {
        const newSortState = toggle ? !this.state.sortAsc : this.state.sortAsc;
        const products = Data.sort((a, b) => {
            return newSortState ? (a.votes - b.votes) : (b.votes - a.votes);
        });
        this.setState({ products: products, sortAsc: newSortState });        
    },
    handleProductUpVote: function (productId) {
        Data.forEach((el) => {
            if (el.id === productId) {
                el.votes = el.votes + 1;
                return;
            }
            this.updateProducts();
        });
    },
    handleProductDownVote: function (productId) {
        Data.forEach((el) => {
            if (el.id === productId) {
                el.votes = el.votes - 1;
                return;
            }
            this.updateProducts();
        });
    },
    handleToggleSortDirection: function () {
        this.updateProducts(true);         
    },
    render: function () { // lifecycle method
        const products = this.state.products.map((product) => {
            return (                
                <Product
                    key={'product-' + product.id}
                    id={product.id} 
                    title={product.title} 
                    description={product.description} 
                    url={product.url} 
                    votes={product.votes} 
                    submitter_avatar_url={product.submitter_avatar_url} 
                    product_image_url={product.product_image_url}
                    onUpVote={this.handleProductUpVote}
                    onDownVote={this.handleProductDownVote}
                />                
            );            
        });
        return (
            <div className='ui items'>
                <button onClick={this.handleToggleSortDirection}>Toggle sort direction</button>
                {products}
            </div>
        );
    }
});

const Product = React.createClass({
    handleUpVote: function () {
        this.props.onUpVote(this.props.id);        
    },
    handleDownVote: function () {
        this.props.onDownVote(this.props.id);        
    },
    render: function () {
        return (
            <div className='item'>
                <div className='image'>
                    <img src={this.props.product_image_url} />
                </div>
                <div className='middle aligned content'>
                    <div className='header'>
                        <a onClick={this.handleUpVote}>
                            <i className='large caret up icon'></i>
                        </a>
                        <a onClick={this.handleDownVote}>
                            <i className='large caret down icon'></i>
                        </a>
                        {this.props.votes}
                    </div>                
                    <div className='description'>
                        <a href={this.props.url}>
                            {this.props.title}
                        </a>
                    </div>
                    <div className='extra'>
                        <span>Submitted by:</span>
                        <img className='ui avatar image' src={this.props.submitter_avatar_url}/>
                    </div>
                </div>
            </div>
        );
    }
});

// what to render, where to render
ReactDOM.render(
  <ProductList/>, 
  document.getElementById('content') 
);
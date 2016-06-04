// Creating class that extends React.Component
// Other way: 
// class ProductList extends React.Component {}
const ProductList = React.createClass({
    render: function () {
        return (
            <div className='ui items'>
                Hello, friend! I am basic React Component
            </div>
        );
    }
});


ReactDOM.render(
  <ProductList />,
  document.getElementById('content')
);
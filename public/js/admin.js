const deleteProduct = (btn) => {
    const prodId = btn.parentNode
        .querySelector('[name=productId]').value;
    const csrf = btn.parentNode
        .querySelector('[name=_csrf]').value;

    // Closest "article" tag in ancestor list
    const productElement = btn.closest('article');

    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        //console.log(result);
        return result.json();
    })
    .then(data => {
        console.log(data);
        console.log(productElement);
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err => console.log(err));
}

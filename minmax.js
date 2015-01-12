Array.prototype.min = function(comparer) {

    if (this.length === 0) return null;
    if (this.length === 1) return this[0];

    comparer = (comparer || Math.min);

    var v = this[0];
    for (var i = 1; i < this.length; i++) {
        v = comparer(this[i], v);    
    }

    return v;
}

Array.prototype.max = function(comparer) {

    if (this.length === 0) return null;
    if (this.length === 1) return this[0];

    comparer = (comparer || Math.max);

    var v = this[0];
    for (var i = 1; i < this.length; i++) {
        v = comparer(this[i], v);    
    }

    return v;
}

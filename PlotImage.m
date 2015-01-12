function [  ] = PlotImage(  )
n = 1000;
range = linspace(-6,6,n);
y = Bird( ones( n,1 ) * range , range' * ones( 1,n )  );

contour( range, range, y, 23);
axis equal
axis off
end


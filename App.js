import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

const ProductSkeleton = ({ index }) => (
  <View style={styles.skeletonItem} key={`skeleton-${index}`}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonTextContainer}>
      <View style={[styles.skeletonText, { width: '80%' }]} />
      <View style={[styles.skeletonText, { width: '40%', marginTop: 8 }]} />
    </View>
  </View>
);

const App = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedProductIds, setLoadedProductIds] = useState(new Set());

  const fetchProducts = useCallback(async (isRefreshing = false) => {
    if ((!hasMore && !isRefreshing) || loading) return;

    setLoading(true);
    setError(null);

    try {
      const limit = 10;
      const response = await fetch('https://fakestoreapi.com/products');
      const data = await response.json();

      const start = isRefreshing ? 0 : (page - 1) * limit;
      const end = start + limit;
      const pageData = data.slice(start, end);

      if (pageData.length === 0) {
        setHasMore(false);
      } else {
        if (isRefreshing) {
          setProducts(pageData);
          setPage(2);
        } else {
          setProducts(prev => [...prev, ...pageData]);
          setPage(prev => prev + 1);
        }
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoadedProductIds(new Set());
    setHasMore(true);
    fetchProducts(true);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating.rate} ★</Text>
          <Text style={styles.ratingCount}>({item.rating.count})</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingFooter}>
        {products.length > 0 ? (
          <>
            <ActivityIndicator size="small" color="#0000ff" />
            <Text style={styles.loadingText}>Loading more products...</Text>
          </>
        ) : null}
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.skeletonContainer}>
          {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={`skeleton-${i}-${Date.now()}`} index={i} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return null;
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchProducts();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#f39c12',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#95a5a6',
  },
  addButton: {
    marginTop: -20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'green',
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: 10,
  },
  skeletonItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  skeletonImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  skeletonTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 6,
  },
});

export default App;

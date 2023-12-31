import React, {useState, useEffect, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Element3} from 'iconsax-react-native';
import {fontType, colors} from '../../theme';
import {ItemSmall} from '../../components';
import {Edit} from 'iconsax-react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const category = [
  {id: 1, label: 'Food'},
  {id: 2, label: 'Sports'},
  {id: 3, label: 'Technology'},
  {id: 4, label: 'Fashion'},
  {id: 5, label: 'Health'},
  {id: 6, label: 'Lifestyle'},
  {id: 7, label: 'Music'},
  {id: 8, label: 'Car'},
];

const ItemCategory = ({item, activeCategory, setActiveCategory}) => {
  return (
    <TouchableOpacity
      style={[
        StyleCategory.button,
        activeCategory === item.id ? StyleCategory.active : {},
      ]}
      onPress={() => setActiveCategory(item.id)}>
      <Text
        style={[
          StyleCategory.label,
          activeCategory === item.id ? StyleCategory.activeText : {},
        ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

const FlatListCategory = ({activeCategory, setActiveCategory}) => {
  return (
    <FlatList
      data={category}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <ItemCategory
          item={item}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      contentContainerStyle={{paddingHorizontal: 24}}
      ItemSeparatorComponent={() => <View style={{width: 10}} />}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default function Home() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [blogData, setBlogData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const subscriber = firestore()
      .collection('blog')
      .onSnapshot(querySnapshot => {
        const blogs = [];
        const categories = [];
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          blogs.push({
            ...data,
            id: documentSnapshot.id,
          });
          categories.push({
            id: data.category.id,
            label: {id: data.category.id, name: data.category.name},
          });
        });
        setBlogData(blogs);
        setCategoryData(categories);
        setLoading(false);
      });
    return () => subscriber();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      firestore()
        .collection('blog')
        .onSnapshot(querySnapshot => {
          const blogs = [];
          querySnapshot.forEach(documentSnapshot => {
            blogs.push({
              ...documentSnapshot.data(),
              id: documentSnapshot.id,
            });
          });
          setBlogData(blogs);
        });
      setRefreshing(false);
    }, 1500);
  }, []);

  const [activeCategory, setActiveCategory] = useState(1);
  const filteredData = activeCategory
    ? blogData.filter(
        blog =>
          blog.category.id === activeCategory &&
          categoryData.find(cat => cat.id === activeCategory)?.name ===
            blog.category.label,
      )
    : blogData;

  console.log(categoryData);
  console.log(blogData);
  console.log(filteredData);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WOCO.</Text>
        <Element3 color={colors.black()} variant="Linear" size={24} />
      </View>
      <View style={styles.listCategory}>
        <FlatListCategory
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.listBlog}>
          <View style={styles.listCard}>
            {loading ? (
              <ActivityIndicator size={'large'} color={colors.blue()} />
            ) : (
              filteredData.map((item, index) => (
                <ItemSmall item={item} key={index} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddBlog')}>
        <Edit color={colors.white()} variant="Linear" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: colors.blue(),
    padding: 15,
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 10,
    shadowColor: colors.blue(),
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white(),
  },
  header: {
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    elevation: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: fontType['Pjs-ExtraBold'],
    color: colors.black(),
  },
  listCategory: {
    paddingVertical: 10,
  },
  listBlog: {
    paddingVertical: 10,
    gap: 10,
  },
  listCard: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 15,
  },
});
const StyleCategory = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderColor: colors.grey(0.15),
    borderWidth: 1,
    backgroundColor: colors.grey(0.03),
  },
  label: {
    fontSize: 12,
    fontFamily: fontType['Pjs-Medium'],
    color: colors.grey(0.65),
  },
  text: {
    fontSize: 14,
    fontFamily: fontType['Pjs-Bold'],
    color: colors.black(),
    paddingVertical: 5,
  },
  active: {
    backgroundColor: colors.blue(),
  },
  activeText: {
    color: colors.white(),
  },
});

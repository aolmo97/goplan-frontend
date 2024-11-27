import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { UI_CONFIG } from '../../config';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Añadir etiqueta',
  suggestions = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !tags.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveTag(index)}
              style={styles.removeButton}
            >
              <FontAwesome name="times" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY}
          onSubmitEditing={() => handleAddTag(inputValue)}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddTag(inputValue)}
          >
            <FontAwesome name="plus" size={16} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleAddTag(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.SMALL,
  },
  tag: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    marginRight: SPACING.SMALL,
  },
  tagText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.SIZES.SMALL,
    marginRight: SPACING.TINY,
  },
  removeButton: {
    padding: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
  },
  input: {
    flex: 1,
    padding: SPACING.MEDIUM,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.TEXT,
  },
  addButton: {
    padding: SPACING.SMALL,
  },
  suggestionsContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    marginTop: SPACING.TINY,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.TEXT,
  },
});

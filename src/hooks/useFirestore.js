import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase.js";

/**
 * Custom hook to fetch and synchronize a single Firestore document.
 * Defensive against cold starts: gracefully accepts a fallback initial state.
 *
 * @param {string} collectionName - Target Firestore collection
 * @param {string} docId - Target Document ID
 * @param {Object} [fallbackData=null] - Default data if document does not exist yet
 */
export function useFirestoreDoc(collectionName, docId, fallbackData = null) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocument = useCallback(async () => {
    if (!collectionName || !docId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else if (fallbackData) {
        setData(fallbackData);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error(`Error loading ${collectionName}/${docId}:`, err);
      setError(err.message || "Failed to load document from Firestore.");
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId, fallbackData]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return { data, setData, loading, error, reload: fetchDocument };
}

/**
 * Persists a document to Firestore, automatically attaching an updated_at server timestamp.
 *
 * @param {string} collectionName - Target Firestore collection
 * @param {string} docId - Target Document ID
 * @param {Object} payload - Document contents
 * @param {boolean} [merge=true] - Whether to merge with existing fields
 * @returns {Promise<Object>}
 */
export async function saveFirestoreDoc(collectionName, docId, payload, merge = true) {
  const docRef = doc(db, collectionName, docId);
  const cleanPayload = {
    ...payload,
    updated_at: serverTimestamp(),
  };
  await setDoc(docRef, cleanPayload, { merge });
  return cleanPayload;
}

export default {
  useFirestoreDoc,
  saveFirestoreDoc,
};

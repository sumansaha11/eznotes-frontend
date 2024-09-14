import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from "react-modal";
import { MdAdd } from "react-icons/md";
import Navbar from '../../components/Navbar/Navbar.jsx';
import NoteCard from '../../components/Cards/NoteCard.jsx';
import AddEditNotes from './AddEditNotes.jsx';
import Toast from '../../components/ToastMessage/Toast.jsx';
import EmptyCard from '../../components/EmptyCard/EmptyCard.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg"

const Home = () => {

    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: "add",
        data: null,
    });

    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: "",
        type: "add",
    });

    const [allNotes, setAllNotes] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [isSearch, setIsSearch] = useState(false);

    const navigate = useNavigate();

    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
    };

    const showToastMessage = (message, type) => {
        setShowToastMsg({
            isShown: true,
            message,
            type,
        });
    };

    const handleCloseToast = () => {
        setShowToastMsg({
            isShown: false,
            message: "",
        });
    };

    const getUserInfo = async () => {
        try {
            const response = await axiosInstance.get("/users/current-user");
            if (response.data && response.data.data) {
                setUserInfo(response.data.data);
            }
        } catch (error) {
            if (error.response.status === 401) {
                navigate("/login");
            }
        }
    };

    const getAllNotes = async () => {
        try {
            const response = await axiosInstance.get("/notes/get-all-notes");
            if (response.data && response.data.data) {
                setAllNotes(response.data.data);
            }
        } catch (error) {
            console.log("An unexpected error occurred! Please try again.");
        }
    };

    const updateIsPinned = async (noteData) => {
        const noteId = noteData._id;
        try {
            const response = await axiosInstance.patch("/notes/update-pin/" + noteId,
                {
                    isPinned: !noteData.isPinned,
                }
            );
            if (response.data && response.data.data) {
                showToastMessage("Note Pin-Status Updated.");
                getAllNotes();
            }
        } catch (error) {
            console.log(error)
        }
    };

    const onSearchNote = async (query) => {
        try {
            const response = await axiosInstance.get("/notes/search-notes", {
                params: { query },
            });

            if (response.data && response.data.data) {
                setIsSearch(true);
                setAllNotes(response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleClearSearch = () => {
        setIsSearch(false);
        getAllNotes();
    };

    const deleteNote = async (data) => {
        const noteId = data._id;
        try {
            const response = await axiosInstance.delete("/notes/delete-note/" + noteId);
            if (response.data && response.data.data) {
                showToastMessage("Note Deleted.", 'delete');
                getAllNotes();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                console.log("An unexpected error occurred! Please try again.");
            }
        }
    };

    useEffect(() => {
        getUserInfo();
        getAllNotes();
    }, []);

    return (
        <>
            <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />

            <div className="container mx-auto">
                {allNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {allNotes.map((item, index) => (
                            <NoteCard
                                key={item._id}
                                title={item.title}
                                date={item.createdAt}
                                content={item.content}
                                tags={item.tags}
                                isPinned={item.isPinned}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => deleteNote(item)}
                                onPinNote={() => updateIsPinned(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyCard
                        imgSrc={isSearch ? NoDataImg : AddNotesImg}
                        message={isSearch ? `Oops! No note found matching your search.` : `Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!`}
                    />
                )}
            </div>

            <button className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10" onClick={() => {
                setOpenAddEditModal({ isShown: true, type: "add", data: null });
            }}>
                <MdAdd className="text-[32px] text-white" />
            </button>

            <Modal
                isOpen={openAddEditModal.isShown}
                onRequestClose={() => { }}
                style={{
                    overlay: {
                        backgroundColor: "rgba(0,0,0,0.2)",
                    },
                }}
                contentLabel=""
                className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
            >
                <AddEditNotes
                    type={openAddEditModal.type}
                    noteData={openAddEditModal.data}
                    onClose={() => {
                        setOpenAddEditModal({ isShown: false, type: "add", data: null });
                    }}
                    getAllNotes={getAllNotes}
                    showToastMessage={showToastMessage}
                />
            </Modal>

            <Toast
                isShown={showToastMsg.isShown}
                message={showToastMsg.message}
                type={showToastMsg.type}
                onClose={handleCloseToast}
            />
        </>
    );
};

export default Home;
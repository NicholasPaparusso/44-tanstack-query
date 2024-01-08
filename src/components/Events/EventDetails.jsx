import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import { useState } from 'react';
import Header from '../Header.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)

  const params = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error} = useQuery({
    queryKey: ['event' ,{id: params.id}],
    queryFn: ({signal}) =>  fetchEvent({signal,id: params.id}),
    enabled: params.id !== undefined,
  });


  const {
    mutate, 
    isPending : isPendingDeletion,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none',
      });
      navigate('/events');
    }
  })

  function handleStartDelete(){
    setIsDeleting(true);
  }
  function handleStopDelete(){
    setIsDeleting(false);
  }
  function handleDeleteEvent(){
    mutate({id: params.id})
  }

  let content

  if(data){
    const {id,title,description,date,time,location,image} = data;
    const formattedDate = new Date(date).toLocaleDateString('it-IT',{
      day: 'numeric',
      month: 'short',
      year: 'numeric',

    })
      content =
      <article id="event-details">
        <header>
          <h1>{title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {time}</time>
            </div>
            <p id="event-details-description">{description}</p>
          </div>
        </div>
      </article>
    }

    if(isPending){
      content = <div id="event-details-content" className='center'>
          <LoadingIndicator/>
        </div>
    }

    if(isError){
      content = 
        <div id="event-details-content" className='center'>
          <ErrorBlock title="Event not found, try again later" message={error.info?.message || 'failed to fecth event data'}/>
        </div>
    }

  return (
    <>
  { isDeleting &&
    <Modal onClose={handleStopDelete}>
        <h2>
          Are u sure ?
        </h2>
        <p>
          Do you really want to delete this event? This action cannot be undone.
        </p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Deleting, please wait...</p>}
          {!isPendingDeletion && 
          <>
            <button className='button-text' onClick={handleStopDelete}>Cancel</button>
            <button className='button' onClick={handleDeleteEvent}>Delete</button>
          </>
          }
        </div>
        {isErrorDeleting && <ErrorBlock title="Failed to delete event." message={errorDeleting.info?.message || 'Failed to delete event, please try again later.'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {content}
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Peer from 'simple-peer';

// Debug WebRTC peer connection events
export const debugWebRTC = (peer: Peer.Instance, context: { callerId: string; receiverId: string; appointmentId: string }) => {
    const { callerId, receiverId, appointmentId } = context;

    // Log ICE connection state changes
    const rtcPeerConnection: RTCPeerConnection = (peer as any)._pc as RTCPeerConnection;
    rtcPeerConnection.oniceconnectionstatechange = () => {
        console.log('WebRTC ICE connection state:', {
            state: rtcPeerConnection.iceConnectionState,
            callerId,
            receiverId,
            appointmentId,
        });
    };

    // Log ICE candidate events
    rtcPeerConnection.onicecandidate = (event) => {
        console.log('WebRTC ICE candidate:', {
            candidate: event.candidate,
            callerId,
            receiverId,
            appointmentId,
        });
    };

    // Log signaling state
    rtcPeerConnection.onsignalingstatechange = () => {
        console.log('WebRTC signaling state:', {
            state: rtcPeerConnection.signalingState,
            callerId,
            receiverId,
            appointmentId,
        });
    };

    // Log stream additions
    peer.on('stream', (stream: MediaStream) => {
        console.log('WebRTC stream received:', {
            streamId: stream.id,
            callerId,
            receiverId,
            appointmentId,
        });
    });

    // Log errors
    peer.on('error', (err: Error) => {
        console.error('WebRTC peer error:', {
            error: err.message,
            callerId,
            receiverId,
            appointmentId,
        });
    });
};